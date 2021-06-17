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
    let totalFee = 0;

    while (currWeight < 4000000) {
      if (4000000 - currWeight >= parseInt(array[i].weight)) {
        // CHECK IF THE TRANSACTION WAS ALREADY INCLUDED IN THE BLOCK
        if (best.includes(array[i].tx_id)) {
          continue;
        }

        // CHECK IF A TRANSACTION HAS PARENTS
        if (array[i].parent) {
          // IF IT DOES, ADD THEM TO THE BLOCK
          array[i].parent.map((txn) => {
            if (4000000 - currWeight >= parseInt(txn.weight)) {
              currWeight = currWeight + parseInt(txn.weight);
              totalFee = totalFee + parseInt(txn.fee);
              best.push(txn.tx_id);
            }
          });
        }
        // ADD TRANSACTION TO BLOCK
        best.push(array[i].tx_id);
        i++;
        // INCREMENT TOTAL FEE AND WEIGHT AFTER TRANSACTION IS ADDED
        totalFee = totalFee + parseInt(array[i].fee);
        currWeight = currWeight + parseInt(array[i].weight);
      } else break;
    }
    // TESTING
    console.log(`Total weight of the block: ${currWeight}`);
    console.log(`Total fee earned: ${totalFee}`);
    console.log(`Total transactions in block: ${best.length}`);

    // WRITE TO BLOCK.TXT
    fs.writeFile("block.txt", best.join("\n"), (err) => {
      // In case of a error throw err.
      if (err) throw err;
    });
  });
});

fs.createReadStream(inputFile).pipe(parser);
