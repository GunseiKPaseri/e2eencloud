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
