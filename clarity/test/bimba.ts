import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity";
import { assert } from "chai";

describe("bimba contract test suite", () => {
  let client: Client;
  let provider: Provider;

  before(async () => {
    provider = await ProviderRegistry.createProvider();
    client = new Client("SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.bimba", "bimba", provider);
  });

  it("should have a valid syntax", async () => {
    await client.checkContract();
  });

  describe("deploying an instance of the contract", () => {
    before(async () => {
      await client.deployContract();
    });

    it("should return url for submit-tweet", async () => {
      const tx = client.createTransaction({
        method: { 
          name: "submit-tweet", 
          args: ["u\"https://twitter.com/markymark/status/1356567037305376770\""] 
        } 
      });

      tx.sign("SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB");

      const receipt = await client.submitTransaction(tx);
      assert.isTrue(receipt.result.startsWith('Transaction executed and committed. Returned: u"https://twitter.com/markymark/status/1356567037305376770"'));
    });

    it("should return u0 for grant-to-recipient by contract creator", async () => {
      const tx = client.createTransaction({
        method: { 
          name: "grant-to-recipient", 
          args: ["'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB"]
        } 
      });

      tx.sign("SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB");

      const receipt = await client.submitTransaction(tx);
      assert.isTrue(receipt.result.startsWith('Transaction executed and committed. Returned: (ok true)'));
    });

    it("should return balance of contact creator", async () => {
      const query = client.createQuery({
        method: { 
          name: "get-balance-of", 
          args: ["'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB"]
        } 
      });

      const receipt = await client.submitQuery(query);
      assert.equal(receipt.result, '(ok u1001)');
    });
  });

  after(async () => {
    await provider.close();
  });
});
