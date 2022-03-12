import { FileInfo, FileInfoFile, FileInfoFolder, FileNode, FileTable } from "../file.type"

const strtest = (target: string, word: string | RegExp, searchType?: 'eq' | 'in'):boolean => {
  if(typeof word === 'string'){
    switch(searchType){
      case 'eq':
        return target === word
      default:
        return target.indexOf(word) !== -1
    }  
  }
  return word.test(target)
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

export const searchTest = (target: FileNode<FileInfoFile>, query: SearchQuery, filetable: FileTable):boolean => {
  for(const orterm of query){
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
          isOK = strtest(target[andterm.type], andterm.word, andterm.seachType)
          break;
        case 'size':
          isOK = numtest(target[andterm.type], andterm.value, andterm.operator)
          break;
      }
    }
    if(isOK) return true
  }
  return false
}

export const searchFromTable = (filetable: FileTable, query: SearchQuery) => {
  let result: string[] = []
  for(const x of Object.values(filetable)){
    // 探索対象は最新のファイル実体のみ
    if(x.type !== 'file' || x.history.length === 0) continue;
    if(searchTest(x, query, filetable)) result.push(x.id)
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
