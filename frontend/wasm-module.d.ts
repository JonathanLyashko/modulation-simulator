declare module "/wasm/dsp.js" {
  const createModule: (options?: {
    locateFile?: (path: string) => string;
  }) => Promise<{
    cwrap: <T extends (...args: number[]) => number | void>(
      name: string,
      returnType: "number" | null,
      argTypes: Array<"number">
    ) => T;
  }>;

  export default createModule;
}
