import { add }  from './add.js';
import { subtraction } from './subtraction.js';

export default function main(){
    let ret = add( 1+5 );
    ret = subtraction( ret -1 );
    return ret;
}