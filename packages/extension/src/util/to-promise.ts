export function toPromise<T = unknown>(thenable: Thenable<T>) {
  return new Promise<T>((resolve, reject) => {
    thenable.then(resolve, reject);
  });
}
