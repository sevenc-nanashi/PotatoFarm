declare module "recursive-last-modified" {
  declare function recursiveLastModified(dir: string | string[]): number

  export = recursiveLastModified
}
