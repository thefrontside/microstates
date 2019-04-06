import { expectType } from "ts-expect";
import { create, StringType, BooleanType, Any } from "microstates";

let a = create(Any);

expectType<Any>(a);
expectType<any>(a.state);

let s = create(StringType);

expectType<StringType>(s);
expectType<string>(s.state);
expectType<StringType>(s.set("foo"));
expectType<StringType>(s.concat("hello"));

let b = create(BooleanType);

expectType<BooleanType>(b);
expectType<boolean>(b.state);
expectType<BooleanType>(b.toggle());


