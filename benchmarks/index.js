
import any from './any.benchmark'
import number from './number.benchmark';
import array from './array.benchmark';
import object from './object.benchmark';
import todomvc from './todomvc.benchmark';

import Benchmark from 'benchmark';
import Table from 'cli-table';

const ENA = 'Err! N/A';

const suite = new Benchmark.Suite({

  onComplete() {
    let table = new Table({
      head: ['Suite', 'Benchmark', 'ops/sec', 'σ', 'sample size']
    })
    for (let i = 0; i < this.length; i++) {
      let benchmark = this[i];
      let { stats } = benchmark;
      if (benchmark.error) {
        table.push([String(benchmark.suiteName), benchmark.name, ENA, ENA, stats.sample.length ]);
      } else {
        let { hz } = benchmark;
        let ops = Benchmark.formatNumber(hz.toFixed(hz < 100 ? 2 : 0))
        let sigma = `± ${stats.rme.toFixed(2)} %`;
        table.push([String(benchmark.suiteName), benchmark.name, ops, sigma, stats.sample.length])
      }
    }
    console.log(String(table));
  },
  onCycle(event) {
    if (!event.target.error) {
      console.log(String(event.target));
    }
  },
  onError(event) {
    let { error } = event.target;
    console.log(String(event.target), error);
  }
});

any(suite);
number(suite);
array(suite);
object(suite);
todomvc(suite);

suite.run({ async: true });
