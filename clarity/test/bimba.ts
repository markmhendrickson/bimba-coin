import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity";
import { assert } from "chai";

describe("bimba contract test suite", () => {
  let bimbaClient: Client;
  let provider: Provider;

  before(async () => {
    provider = await ProviderRegistry.createProvider();
    bimbaClient = new Client("SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.bimba", "bimba", provider);
  });

  it("should have a valid syntax", async () => {
    await bimbaClient.checkContract();
  });

  describe("deploying an instance of the contract", () => {
    before(async () => {
      await bimbaClient.deployContract();
    });

    it("should return true for submit-tweet", async () => {
      const query = bimbaClient.createQuery({ method: { name: "submit-tweet", args: ["u\"https://twitter.com/markymark/status/1356567037305376770\""] } });
      const receipt = await bimbaClient.submitQuery(query);
      const result = Result.unwrapString(receipt, "utf8");
      assert.equal(result, true);
    });
  });

  after(async () => {
    await provider.close();
  });
});
