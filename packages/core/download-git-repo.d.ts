declare module 'download-git-repo' {
  export default function download(
    repo: string,
    dest: string,
    opts?: object,
    fn?: (error: string) => void
  ): void;
}
