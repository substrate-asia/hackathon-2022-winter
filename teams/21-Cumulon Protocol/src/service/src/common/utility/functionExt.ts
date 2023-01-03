export class FunctionExt {
  constructor(parameters) {}

  public static async sleep(delay) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          resolve(1);
        } catch (e) {
          reject(0);
        }
      }, delay);
    });
  }
}
