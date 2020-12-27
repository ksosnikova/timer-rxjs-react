import './App.css';
import { interval, merge, Subject } from 'rxjs';
import { useState, useEffect } from 'react';
import {
  filter,
  takeUntil,
  scan,
  startWith,
  mapTo,
  debounceTime,
  switchMapTo,
  buffer,
  map,
  repeatWhen
} from 'rxjs/operators';
import Button from './components/Button';

const action$ = new Subject();

const start$ = action$.pipe(filter(action => action === 'start'));
const stop$ = action$.pipe(filter(action => action === 'stop'));
const wait$ = action$.pipe(filter(action => action === 'wait'));
const reset$ = action$.pipe(filter(action => action === 'reset'));

const timer$ = interval(1000);

const startCount = 0;
const increaseCount = acc => acc + 1;
const stopCount = acc => startCount;

const doubleClickOnWait$ = wait$.pipe(
  buffer(wait$.pipe(debounceTime(300))),
  map(list => { return list.length }),
  filter(x => x === 2),
);

const stopOrWait$ = timer$.pipe(
  takeUntil(merge(stop$, doubleClickOnWait$)),
  repeatWhen(() => reset$)
);

const switchButtons$ = merge(
  stopOrWait$.pipe(mapTo(increaseCount)),
  stop$.pipe(mapTo(stopCount)),
  reset$.pipe(mapTo(stopCount))
)

const observable$ = start$.pipe(
  switchMapTo(switchButtons$),
  startWith(startCount),
  repeatWhen(() => reset$),
  scan((acc, currentFn) => currentFn(acc)),
);


function App() {

  const [state, setState] = useState(0);

  useEffect(() => {
    const sub = observable$.subscribe(res => setState(res));
    return () => sub.unsubscribe()
  }, [])

  const convertFromSecsToTimer = (secs) => {
    let hours = Math.floor(secs / 60 / 60);
    let minutes = Math.floor(secs / 60) - (hours * 60);
    let seconds = secs % 60;
    let formattedTime = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
    return formattedTime;
  }

  const times = convertFromSecsToTimer(state);

  const buttons = ['start', 'stop', 'wait', 'reset'];

  return (
    <div className="App">
      <h2>Timer</h2>
      <div className="display">{times}</div>
      <div className="buttons">
        {buttons.map((button, i) => (<Button
          key={i}
          value={button}
          callback={() => action$.next(button)}
        />))}
      </div>
    </div>
  );
}

export default App;
