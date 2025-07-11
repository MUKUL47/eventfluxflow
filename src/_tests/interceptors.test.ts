import { EventFluxFlow as EventFlux } from "../eventfluxflow";
const delay = async (n = 0) =>
  await new Promise((resolve) => setTimeout(resolve, n));

describe("Interceptors", () => {
  test("should intercept mutuable data", async () => {
    const E = new EventFlux<{ TEST: { resp: number } }>();
    const fn = jest.fn();
    E.intercept(
      "TEST",
      (arg) => {
        arg.resp *= arg.resp;
      },
      true
    );
    E.on("TEST", fn);
    E.emit("TEST", { resp: 2 });
    E.emit("TEST", { resp: 13 });
    E.emit("TEST", { resp: 9 });
    expect(fn).toHaveBeenCalledWith({ resp: 2 * 2 });
    expect(fn).toHaveBeenCalledWith({ resp: 13 * 13 });
    expect(fn).toHaveBeenCalledWith({ resp: 9 * 9 });
  });
  test("should intercept immutuable data", async () => {
    const E = new EventFlux<{ TEST: { resp: number } }>();
    const fn = jest.fn();
    E.intercept("TEST", (arg: any) => {
      try {
        arg.resp *= arg.resp;
      } catch (e) {
        //Tried modifying frozen object supress error while in use strict mode
      }
    });
    E.on("TEST", fn);
    E.emit("TEST", { resp: 2 });
    await delay();
    expect(fn).toHaveBeenCalledWith({ resp: 2 });
  });
  test("should intercept immutuable & mutable data simultaneously", async () => {
    const E = new EventFlux<{ TEST: { resp: number } }>();
    const fn = jest.fn();
    E.intercept(
      "TEST",
      (arg: any) => {
        arg.resp++;
      },
      true
    );
    E.intercept("TEST", (arg: any) => {
      try {
        arg.resp *= arg.resp;
      } catch (e) {
        //Tried modifying frozen object supress error while in use strict mode
      }
    });
    E.intercept(
      "TEST",
      (arg: any) => {
        arg.resp++;
      },
      true
    );
    E.on("TEST", fn);
    E.emit("TEST", { resp: 2 });
    await delay();
    expect(fn).toHaveBeenCalledWith({ resp: 4 });
  });
  test("should remove intercept after invoking", async () => {
    const E = new EventFlux<{ TEST: any }>();
    const fn = jest.fn();
    E.intercept("TEST", fn);
    E.on("TEST", () => {});
    E.emit("TEST", true);
    E.interceptOff("TEST", fn);
    E.emit("TEST", true);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
