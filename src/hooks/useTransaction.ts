/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import Transaction from "../utils/explorer-types";
import { explorerInstance } from "../axios/axios";
import { getTxByTxId } from "../axios/requests";

export const useTransaction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError] = useState(false);
  const [transaction, setTransaction] = useState<Transaction>();
  const [block, setBlock] = useState<any>();
  const [contractDetails, setContractDetails] = useState<any>();
  const [contractCode, setContractCode] = useState<any>();
  const [microBlock, setMicroBlock] = useState<any>();
  const [blockTransaction, setBlockTransaction] = useState<any>([]);

  const getBlock = (block: string) => {
    return fetch(
      "https://stacks-node-api.mainnet.stacks.co/extended/v1/block/by_height/" +
        block
    )
      .then((response) => response.json())
      .then((data) => setBlock(data));
  };

  const getMicroblocks = (hash: string) => {
    return fetch(
      "https://stacks-node-api.mainnet.stacks.co/extended/v1/microblock/" + hash
    )
      .then((response) => response.json())
      .then((data) => setMicroBlock(data));
  };

  const getBlockTransactions = (block: string) => {
    return fetch(
      "https://stacks-node-api.mainnet.stacks.co/extended/v1/tx/block/" + block
    )
      .then((response) => response.json())
      .then((data) => setBlockTransaction(data.results));
  };

  const getTransaction = (id: string) => {
    setIsLoading(true);
    console.log(id);
    explorerInstance.get(getTxByTxId(id)).then((data: any) => {
      setTransaction(data);
      if (!data) {
        explorerInstance.get(getTxByTxId(id)).then((data: any) => {
          setTransaction(data);
        });
      }
    });
    setIsLoading(false);
  };

  const getContractDetails = (tx: any) => {
    const name = tx.contract_call.contract_id.split(".")[1];
    const address = tx.contract_call.contract_id.split(".")[0];
    fetch(
      `https://stacks-node-api.mainnet.stacks.co/v2/contracts/interface/${address}/${name}`
    )
      .then((response) => response.json())
      .then((data) =>
        setContractDetails({
          functions: data.functions || [],
          maps: data.map || [],
          variables: data.variables || [],
          fungible_tokens: data.fungible_tokens || [],
        })
      );
  };

  const getContractCode = (tx: any) => {
    const name = tx.contract_call.contract_id.split(".")[1];
    const address = tx.contract_call.contract_id.split(".")[0];
    fetch(
      `https://stacks-node-api.mainnet.stacks.co/v2/contracts/source/${address}/${name}`
    )
      .then((response) => response.json())
      .then((data) =>
        setContractCode({
          source: data.source,
        })
      );
  };

  return {
    hasError,
    getContractDetails,
    isLoading,
    transaction,
    getContractCode,
    contractCode,
    contractDetails,
    getBlockTransactions,
    block,
    blockTransaction,
    getMicroblocks,
    microBlock,
    getBlock,
    getTransaction,
  };
};
