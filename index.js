// const reader = new FileReader();

const fs = require("fs");
const parse = require("csv-parse");
const async = require("async");
const inputFile = "mempool.csv";

let array = [];
const parser = parse({ dlistItemimiter: "," }, function (err, data) {
  async.eachSeries(data, function (line, callback) {
    // do something with the line
    // console.log(data);
    data.map((listItem, index) => {
      // array.push(listItem);
      const txn = {};
      txn.no = index;
      txn.tx_id = listItem[0];
      txn.fee = listItem[1];
      txn.weight = listItem[2];
      txn.parent = [];
      let i = 3;
      while (listItem[i]) {
        txn.parent.push(listItem[i]);
        i++;
      }
      array.push(txn);
    });
    console.log(array.length);
    array.map((txn) => {
      let priority = txn.fee / txn.weight;
      txn.priority = priority;
    });
    array.sort((first, second) => second.priority - first.priority);
    // console.log(array[2]);
    const best = [];
    let i = 1;
    let currWeight = 0;
    while (currWeight < 4000000) {
      if (4000000 - currWeight >= parseInt(array[i].weight)) {
        // const txnNew = {};

        if (array[i].parent) {
          // console.log(array[i].parent);
          array[i].parent.map((txn) => {
            if (4000000 - currWeight >= parseInt(array[i].weight))
              currWeight = currWeight + parseInt(array[i].weight);
            // txnNew.no = txn.no;
            // txnNew.id = txn.tx_id;
            // best.push(txnNew);
            best.push(txn.tx_id);
          });
        }
        if (best.includes(array[i].tx_id)) {
          continue;
        }
        // txnNew.no = array[i].no;
        // txnNew.id = array[i].tx_id;
        // best.push(txnNew);
        best.push(array[i].tx_id);
        i++;

        currWeight = currWeight + parseInt(array[i].weight);
      } else break;
    }
    console.log(currWeight);
    console.log(best[1]);
    console.log(best.length);

    fs.writeFile("block.txt", best.join("\n"), (err) => {
      // In case of a error throw err.
      if (err) throw err;
    });
  });
});

fs.createReadStream(inputFile).pipe(parser);
