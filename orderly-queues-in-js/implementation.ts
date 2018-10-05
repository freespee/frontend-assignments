/**
* Please provide your implementation in this file. 
The queue object will start emitting values as soon as it is
instantiated.
*/
import { Queue } from './queue';

const q = new Queue();
/**
 * q.emitter will emit events at a random interval
 */
q.emitter.addListener('package', (x: number) => {});
