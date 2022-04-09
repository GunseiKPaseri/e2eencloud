import { FileInfo, FileInfoFile, FileInfoFolder, FileNode, FileTable } from "../file.type"

const strtest = (target: string, word: string | RegExp, searchType?: 'eq' | 'in'):[number, number] | null => {
  if(typeof word === 'string'){
    switch(searchType){
      case 'eq':
        return target === word ? [0, word.length] : null
      default:
        const p = target.indexOf(word)
        return p !== -1 ? [p, p + word.length] : null
    }  
  }
  const found = word.exec(target)
  return found ? [found.index, found.index + found[0].length] : null 
}

const numtest = (target: number, value: number, operator: '>' | '<' | '>=' | '<=' | '=='):boolean => {
  switch(operator){
    case '>':
      return target > value
    case '<':
      return target < value
    case '>=':
      return target >= value
    case '<=':
      return target <= value
    case '==':
      return target === value
  }
}

export type SearchQuerySet =
{
  type: 'tag',
  value: string
} | 
{
  type: 'dir',
  id: string,
  searchSubDir: boolean
} |
// str
{
  type: 'name' | 'mime',
  word: string | RegExp,
  seachType?: Parameters<typeof strtest>[2]
} |
// num
{
  type: 'size',
  value: number,
  operator: Parameters<typeof numtest>[2]
}

export type SearchQuery = SearchQuerySet[][]

export type Highlight = ['name' | 'mime', number, number]

export const searchTest = (target: FileNode<FileInfoFile>, query: SearchQuery, filetable: FileTable): Highlight[] | null => {
  for(const orterm of query){
    const marker: Highlight[] = []
    let isOK:boolean = true
    for(const andterm of orterm){
      if(!isOK) break;
      switch(andterm.type){
        case 'tag':
          isOK = target.tag.includes(andterm.value)
          break;
        case 'dir':
          if(andterm.searchSubDir){
            let t: string|null = target.id
            let isSubDir: boolean = false
            while(t){
              const target: FileNode<FileInfo> = filetable[t]
              if(andterm.id === target.id){
                isSubDir = true
                break;
              }
              t = target.parentId
            }
            isOK = isSubDir
          } else {
            isOK = target.prevId === andterm.id
          }
          break;
        case 'name':
        case 'mime':
          const mk = strtest(target[andterm.type], andterm.word, andterm.seachType)
          if(mk){
            marker.push([andterm.type, ...mk])
          }
          isOK = !!mk
          break;
        case 'size':
          isOK = numtest(target[andterm.type], andterm.value, andterm.operator)
          break;
      }
    }
    if(isOK) return marker.sort((a, b) => a[1] - b[1] === 0 ? a[2] - b[2] : a[1] - b[1])
  }
  return null
}

const addMark = (value: string, start: number, end: number) => {
  return `${value.slice(0, start)}<mark>${value.slice(start, end)}</mark>${value.slice(end)}`
}

export const highlightMark = (value: string, target: Highlight[0], marker:Highlight[]) => {
  // marker is sorted by maker[1]
  let preStart = -1, preEnd = -1, expansion = 0, variablevalue = value
  for(const x of marker){
    if(target !== x[0]) continue
    if(x[1] + expansion < preEnd) {
      preEnd = x[2] + expansion
    } else {
      if(preEnd >= 0){
        variablevalue = addMark(variablevalue, preStart, preEnd)
        expansion += 13
      }
      preStart = x[1] + expansion
      preEnd = x[2] + expansion
    }
  }
  if(preEnd >= 0) variablevalue = addMark(variablevalue, preStart, preEnd)
  return variablevalue
}

export const searchFromTable = (filetable: FileTable, query: SearchQuery) => {
  let result: [string, Highlight[]][] = []
  for(const x of Object.values(filetable)){
    // 探索対象は最新のファイル実体のみ
    if(x.type !== 'file' || x.history.length === 0) continue;
    const mk = searchTest(x, query, filetable)
    if(mk) result.push([x.id, mk])
  }
  return result
}

type SearchQueryToken = SearchQuerySet | {'type': 'OR'} | null
export class SearchQueryParser{
  #queryString: string
  #querySize: number
  #currentPoint :number
  #token: SearchQueryToken
  #result: SearchQuery | null
  constructor(queryString: string){
    this.#queryString = queryString
    this.#querySize = queryString.length
    this.#currentPoint = 0
    this.#result = null
    this.#token = null
  }

  get query():SearchQuery {
    if(this.#result) return this.#result
    
    const result = this.#statement()
    this.#result = result
    return result
  }
  #statement(): SearchQuery{
    let token: SearchQueryToken
    let orterms: SearchQuerySet[][] = []
    let andterms: SearchQuerySet[] = []
    while(token = this.#nextToken()){
      if(token.type === 'OR'){
        if(andterms.length > 0) orterms.push(andterms)
        andterms = []
      } else {
        andterms.push(token)
      }
    }
    if(andterms.length > 0) orterms.push(andterms)
    return orterms
  }
  /**
   * 空白文字でない文字まで移動する
   */
  #skipSpace():void {
    while(this.#currentPoint < this.#querySize && /\s/.test(this.#queryString[this.#currentPoint])){
      this.#currentPoint++
    }
  }

  /**
   * 指定位置から始まる文字列を切り出す
   *  */
  #word(): {value: string, exact: boolean}{
    let t=''
    while(this.#currentPoint < this.#querySize && /[^\s]/.test(this.#queryString[this.#currentPoint])){
      t+=this.#queryString[this.#currentPoint]
      this.#currentPoint++
    }
    return {value: t, exact: false}
  }
  /**
   * 指定位置から始まる数字を切り出す
   *  */
  #number(): number{
    let n=0
    while(this.#currentPoint < this.#querySize && /\d/.test(this.#queryString[this.#currentPoint])){
      n = n*10 + parseInt(this.#queryString[this.#currentPoint])
      this.#currentPoint++
    }
    return n
  }
  /**
   * 指定位置から始まる演算子の取得
   */
  #operator():Parameters<typeof numtest>[2]|null {
    const next2 = this.#queryString.slice( this.#currentPoint, this.#currentPoint + 2 )
    if(next2 === '<=' || next2 === '>=' || next2 === '=='){
      this.#currentPoint += 2
      return next2
    }
    const next = this.#queryString.slice( this.#currentPoint, this.#currentPoint + 1 )
    if(next === '='){
      this.#currentPoint += 1
      return '=='
    }
    if(next === '<' || next === '>'){
      this.#currentPoint += 1
      return next
    }
    return null
  }

  #nextToken(): SearchQueryToken{
    this.#skipSpace()
    if(this.#currentPoint >= this.#querySize) return null

    // super query
    const next4 = this.#queryString.slice( this.#currentPoint, this.#currentPoint + 4 ).toLowerCase()
    if( next4 === 'tag:'){
      // tag
      this.#currentPoint += 4
      this.#skipSpace()
      const value = this.#word().value
      return {type: 'tag', value}
    }
    const next5 = this.#queryString.slice( this.#currentPoint, this.#currentPoint + 5 ).toLowerCase()
    if( (next4 === 'mime' || next4 === 'name') && next5[4] === ':'){
      // mime
      this.#currentPoint += 5
      this.#skipSpace()
      const word = this.#word().value
      return {type: next4, word}
    } else if(next5 === 'size:'){
      // size
      this.#currentPoint += 5
      this.#skipSpace()
      const operator = this.#operator() ?? '=='
      this.#skipSpace()
      const value = this.#number()
      return {type: 'size', value, operator}
    }
    const value = this.#word()
    if(value.exact === false && value.value.toLowerCase() === 'or'){
      return {type: 'OR'}
    }

    return {type: 'name', word: value.value}
  }
}
