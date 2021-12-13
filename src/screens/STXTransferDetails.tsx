/* eslint-disable no-useless-concat */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useTransaction } from "../hooks/useTransaction";
import {
  capitalize,
  getAddressValue,
  getAmount,
  getConditionTicker,
  getPrettyCode,
  microToStacks,
  truncateMiddle,
} from "../utils/utils";
// import { CopyBlock, dracula } from "react-code-blocks";
import Stacks from "../assets/side-menu/stacks.svg";
import { Events } from "../components/Events";
import useWindowDimensions from "../hooks/useWindowDimension";
import { TransactionHeaderDetails } from "../components/TransactionHeaderDetails";
// import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
interface Props {
  theme: any;
  themeToggler: any;
  failure: boolean;
}

export const STXTransferDetails: React.FC<Props> = ({
  theme,
  themeToggler,
  failure,
}) => {
  const params: any = useParams();
  const [toggle, setToggle] = useState(false);
  const [txId, setTxId] = useState("");
  const {
    getTransaction,
    transaction,
    getContractDetails,
    contractDetails,
    // isLoading,
    // contractCode,
    getContractCode,
    fails,
  } = useTransaction();
  useEffect(() => {
    const { innerWidth: width } = window;
    setToggle(width >= 1025);
  }, [toggle]);
  const { push } = useHistory();

  useEffect(() => {
    console.log(fails);
    if (fails) {
      push("/upgrading");
    }
  }, [fails]);

  const dims = useWindowDimensions();
  useEffect(() => {
    if (params?.txId) {
      setTxId(params.txId);
    }
  }, [params]);
  useEffect(() => {
    if (txId) {
      getTransaction(txId);
      // getAddressSatsCommitted(address);
      // getBlocksMiner(address);
      // getBlocksForAddress(address);
    }
  }, [txId]);

  useEffect(() => {
    if (
      transaction?.tx_type === "contract_call" ||
      transaction?.tx_type === "smart_contract"
    ) {
      getContractDetails(transaction);
      getContractCode(transaction);
    }
  }, [transaction]);

  useEffect(() => {
    if (failure) {
      push("/upgrading");
    }
  }, [failure, theme]);
  return (
    <div className="explorer">
      {transaction && (transaction as any).contract_call && (
        <>
          <TransactionHeaderDetails
            dims={dims}
            theme={theme}
            transaction={transaction}
          />
          <div id="transactionContainer" className="transaction-container">
            <div className="recent-transactions">
              <div style={{ height: "auto" }} className="rt-table">
                <div className="table-header">
                  <p>Overview</p>
                </div>
                <div className="transaction-row">
                  <p className="title">Contract</p>
                  <p className="subtitle">
                    {(transaction as any).tx_type === "contract_call" &&
                      (transaction as any).contract_call.contract_id}
                  </p>
                </div>
                <div className="transaction-row">
                  <p className="title">Transaction ID</p>
                  <p className="subtitle">{transaction?.tx_id}</p>
                </div>
                <div
                  className="transaction-row"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    push("/explorer/address/" + transaction.sender_address);
                  }}
                >
                  <p className="title">Called by</p>
                  <p className="subtitle">{transaction?.sender_address}</p>
                </div>
                <div className="transaction-row">
                  <p className="title">Fees</p>
                  <p className="subtitle">
                    {microToStacks(transaction?.fee_rate)} STX
                  </p>
                </div>
                <div className="transaction-row">
                  <p className="title">Nonce</p>
                  <p className="subtitle">{transaction?.nonce}</p>
                </div>
                <div className="transaction-row">
                  <p className="title">Block Height</p>
                  <p className="subtitle">{transaction?.block_height}</p>
                </div>
                <div className="transaction-row">
                  <p className="title">Block hash</p>
                  <p className="subtitle">{transaction?.block_hash}</p>
                </div>
              </div>
              {transaction.events && transaction.events.length > 0 && (
                <div style={{ height: "auto" }} className="rt-table">
                  <div className="table-header">
                    <p>Events</p>
                  </div>
                  <Events events={transaction.events} />
                </div>
              )}

              <div style={{ height: "auto" }} className="rt-table">
                <div className="table-header">
                  <p>Function Call</p>
                </div>
                <div className="transaction-row">
                  <p className="title">Function Name</p>
                  <p className="subtitle">
                    {(transaction as any).contract_call.function_name}
                  </p>
                </div>
                {transaction.tx_result && (
                  <div className="transaction-row">
                    <p className="title">
                      Results (
                      {transaction.tx_status === "abort_by_response" ||
                      transaction.tx_status === "abort_by_post_condition"
                        ? "Failed"
                        : "Success"}
                      )
                    </p>
                    <p className="subtitle">{transaction.tx_result.repr}</p>
                  </div>
                )}
                {(transaction as any).contract_call &&
                  (transaction as any).contract_call.function_args &&
                  (transaction as any).contract_call.function_args.map(
                    (arg: any) => {
                      return (
                        <div className="function-call">
                          <div
                            style={{ borderTop: 0 }}
                            className="transaction-row"
                          >
                            <p className="title">→ Arguments</p>
                            <p className="subtitle color">{arg.name}</p>
                          </div>
                          <div
                            style={{ borderTop: 0 }}
                            className="transaction-row"
                          >
                            <p className="title">→ hashbytes</p>
                            <p className="subtitle">
                              {truncateMiddle(arg?.hex, 10)}
                            </p>
                          </div>
                          <div
                            style={{ borderTop: 0 }}
                            className="transaction-row"
                          >
                            <p className="title">→ version</p>
                            <p className="subtitle">
                              {truncateMiddle(arg?.repr, 10)}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )}
              </div>
              {transaction.post_conditions.length > 0 && (
                <div style={{ height: "auto" }} className="rt-table">
                  <div className="table-header">
                    <img
                      className="transaction-image"
                      alt="transaction"
                      src={Stacks}
                    />
                    <p>Post conditions</p>
                  </div>
                  <div className="transaction-row">
                    {transaction.post_conditions.map((condition) => {
                      return (
                        <div>
                          <p style={{ textAlign: "left" }} className="subtitle">
                            {truncateMiddle(getAddressValue(condition), 8)}
                          </p>
                          <p className="title">
                            {capitalize(
                              getPrettyCode(condition.condition_code, true)
                            )}{" "}
                            {getAmount(condition)}{" "}
                            {getConditionTicker(condition)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="anchor-block">
              <div style={{ height: "auto" }} className="ab-table">
                <div className="table-header">
                  <p>Contract Detail</p>
                </div>
                <div style={{ borderTop: 0 }} className="transaction-row">
                  <p className="subtitle">
                    {
                      (transaction as any).contract_call.contract_id.split(
                        "."
                      )[1]
                    }
                  </p>
                  <p className="title">
                    {truncateMiddle(transaction.block_hash, 10)}
                  </p>
                </div>
                {contractDetails && (
                  <>
                    <div className="transaction-row">
                      <p className="title">Function</p>
                      <p className="subtitle">
                        {contractDetails.functions.length}
                      </p>
                    </div>
                    <div className="transaction-row">
                      <p className="title">Variables</p>
                      <p className="subtitle">
                        {contractDetails.variables.length}
                      </p>
                    </div>
                    <div className="transaction-row">
                      <p className="title">Map</p>
                      <p className="subtitle">{contractDetails.maps.length}</p>
                    </div>
                    <div className="transaction-row">
                      <p className="title">Token</p>
                      <p className="subtitle">
                        {contractDetails.fungible_tokens.length}
                      </p>
                    </div>
                  </>
                )}
              </div>
              {transaction.tx_status === "success" && (
                <div style={{ height: "auto" }} className="ab-table">
                  <div className="table-header">
                    <p className="title">Bitcoin anchor</p>
                  </div>
                  <div className="transaction-row">
                    <p className="title">Bitcoin Block Height</p>
                    <p className="subtitle">
                      {(transaction as any).block_anchor_info
                        ? (transaction as any).block_anchor_info
                            .bitcoin_block_height
                        : "Pending.."}
                    </p>
                  </div>
                  <div className="transaction-row">
                    <p className="title">Bitcoin Block Hash</p>
                    <p className="subtitle">
                      {/* {truncateMiddle(
                        (transaction as any).block_anchor_info
                          .bitcoin_block_hash,
                        10
                      )} */}
                    </p>
                  </div>
                  <div className="transaction-row">
                    <p className="title">Anchor transaction id</p>
                    <p className="subtitle">
                      {/* {truncateMiddle(
                        (transaction as any).block_anchor_info.bitcoin_tx_hash,
                        10
                      )} */}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* {contractCode && contractCode.source && dims.width > 1000 && (
            <div style={{ width: "100%" }}>
              <CopyBlock
                language={"clojure"}
                text={contractCode.source}
                showLineNumbers={true}
                theme={dracula}
                wrapLines={true}
                codeBlock
              />
            </div>
          )} */}
        </>
      )}
      {transaction && (transaction as any).token_transfer && (
        <>
          <TransactionHeaderDetails
            dims={dims}
            theme={theme}
            transaction={transaction}
          />
          <div id="transactionContainer" className="transaction-container">
            <div className="recent-transactions">
              <div style={{ height: "auto" }} className="rt-table">
                <div className="table-header">
                  <p>Overview</p>
                </div>
                <div className="transaction-row">
                  <p className="title">Amount</p>
                  <p className="subtitle">
                    {(transaction as any).tx_type === "token_transfer" &&
                      microToStacks(
                        (transaction as any).token_transfer.amount
                      )}{" "}
                    STX
                  </p>
                </div>
                <div className="transaction-row">
                  <p className="title">Transaction ID</p>
                  <p className="subtitle">{transaction?.tx_id}</p>
                </div>
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    push("/explorer/address/" + transaction.sender_address);
                  }}
                  className="transaction-row"
                >
                  <p className="title">Sender Address</p>
                  <p className="subtitle">{transaction?.sender_address}</p>
                </div>
                <div
                  className="transaction-row"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    push(
                      "/explorer/address/" +
                        (transaction as any).token_transfer.recipient_address
                    );
                  }}
                >
                  <p className="title">Recipient</p>
                  <p className="subtitle">
                    {(transaction as any).token_transfer.recipient_address}
                  </p>
                </div>
                <div className="transaction-row">
                  <p className="title">Fees</p>
                  <p className="subtitle">
                    {microToStacks(transaction?.fee_rate)} STX
                  </p>
                </div>
                <div className="transaction-row">
                  <p className="title">Nonce</p>
                  <p className="subtitle">{transaction?.nonce}</p>
                </div>
                <div className="transaction-row">
                  <p className="title">Block Height</p>
                  <p className="subtitle">{transaction?.block_height}</p>
                </div>
                <div className="transaction-row">
                  <p className="title">Block hash</p>
                  <p className="subtitle">{transaction?.block_hash}</p>
                </div>
              </div>
              {transaction.events && transaction.events.length > 0 && (
                <div style={{ height: "auto" }} className="rt-table">
                  <div className="table-header">
                    <p>Events</p>
                  </div>
                  <Events events={transaction.events} />
                </div>
              )}
              {transaction.post_conditions.length > 0 && (
                <div style={{ height: "auto" }} className="rt-table">
                  <div className="table-header">
                    <img
                      className="transaction-image"
                      alt="transaction"
                      src={Stacks}
                    />
                    <p>Post conditions</p>
                  </div>
                  <div className="transaction-row">
                    {transaction.post_conditions.map((condition) => {
                      return (
                        <div>
                          <p style={{ textAlign: "left" }} className="subtitle">
                            {truncateMiddle(getAddressValue(condition), 8)}
                          </p>
                          <p className="title">
                            {capitalize(
                              getPrettyCode(condition.condition_code, true)
                            )}{" "}
                            {getAmount(condition)}{" "}
                            {getConditionTicker(condition)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {transaction.tx_status === "success" && (
              <div className="anchor-block">
                <div style={{ height: "auto" }} className="ab-table">
                  <div className="table-header">
                    <p className="title">Bitcoin anchor</p>
                  </div>
                  <div className="transaction-row">
                    <p className="title">Bitcoin Block Height</p>
                    <p className="subtitle">
                      {(transaction as any).block_anchor_info
                        ? (transaction as any).block_anchor_info
                            .bitcoin_block_height
                        : "Pending.."}
                    </p>
                  </div>
                  <div className="transaction-row">
                    <p className="title">Bitcoin Block Hash</p>
                    <p className="subtitle">
                      {/* {truncateMiddle(
                        (transaction as any).block_anchor_info
                          .bitcoin_block_hash,
                        10
                      )} */}
                    </p>
                  </div>
                  <div className="transaction-row">
                    <p className="title">Anchor transaction id</p>
                    <p className="subtitle">
                      {/* {truncateMiddle(
                        (transaction as any).block_anchor_info.bitcoin_tx_hash,
                        10
                      )} */}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {transaction && (transaction as any).coinbase_payload && (
        <>
          <TransactionHeaderDetails
            dims={dims}
            theme={theme}
            transaction={transaction}
          />
          <div id="transactionContainer" className="transaction-container">
            <div className="recent-transactions">
              <div style={{ height: "auto" }} className="rt-table">
                <div className="table-header">
                  <p>Summary</p>
                </div>
                <div className="transaction-row">
                  <p className="title">Transaction ID</p>
                  <p className="subtitle">{transaction?.tx_id}</p>
                </div>
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    push("/explorer/address/" + transaction.sender_address);
                  }}
                  className="transaction-row"
                >
                  <p className="title">Sender address</p>
                  <p className="subtitle">{transaction?.sender_address}</p>
                </div>
                <div className="transaction-row">
                  <p className="title">Fees</p>
                  <p className="subtitle">
                    {microToStacks(transaction?.fee_rate)} STX
                  </p>
                </div>
                <div className="transaction-row">
                  <p className="title">Nonce</p>
                  <p className="subtitle">{transaction?.nonce}</p>
                </div>
                <div className="transaction-row">
                  <p className="title">Block height</p>
                  <p className="subtitle">{transaction?.block_height}</p>
                </div>
                <div className="transaction-row">
                  <p className="title">Block hash</p>
                  <p className="subtitle">{transaction?.block_hash}</p>
                </div>
              </div>
            </div>
            {transaction.tx_status === "success" && (
              <div className="anchor-block">
                <div style={{ height: "auto" }} className="ab-table">
                  <div className="table-header">
                    <p className="title">Bitcoin anchor</p>
                  </div>
                  <div className="transaction-row">
                    <p className="title">Bitcoin block height</p>
                    <p className="subtitle">
                      {(transaction as any).block_anchor_info
                        ? (transaction as any).block_anchor_info
                            .bitcoin_block_height
                        : "Pending.."}
                    </p>
                  </div>
                  <div className="transaction-row">
                    <p className="title">Bitcoin block hash</p>
                    <p className="subtitle">
                      {/* {truncateMiddle(
                        (transaction as any).block_anchor_info
                          .bitcoin_block_hash,
                        10
                      )} */}
                    </p>
                  </div>
                  <div className="transaction-row">
                    <p className="title">Anchor transaction id</p>
                    <p className="subtitle">
                      {/* {truncateMiddle(
                        (transaction as any).block_anchor_info.bitcoin_tx_hash,
                        10
                      )} */}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
