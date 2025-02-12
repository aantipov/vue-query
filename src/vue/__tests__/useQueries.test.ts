import { onUnmounted, reactive } from "vue-demi";
import { setLogger } from "react-query/core";

import {
  flushPromises,
  rejectFetcher,
  simpleFetcher,
  getSimpleFetcherWithReturnData,
  noop,
} from "./test-utils";
import { useQueries } from "../useQueries";

jest.mock("../useQueryClient");

describe("useQueries", () => {
  beforeAll(() => {
    setLogger({ log: noop, warn: noop, error: noop });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return result for each query", () => {
    const queries = [
      {
        queryKey: "key1",
        queryFn: simpleFetcher,
      },
      {
        queryKey: "key2",
        queryFn: simpleFetcher,
      },
    ];
    const queriesState = useQueries(queries);

    expect(queriesState).toMatchObject([
      {
        status: "loading",
        isLoading: true,
        isFetching: true,
        isStale: true,
      },
      {
        status: "loading",
        isLoading: true,
        isFetching: true,
        isStale: true,
      },
    ]);
  });

  test("should resolve to success and update reactive state", async () => {
    const queries = [
      {
        queryKey: "key11",
        queryFn: simpleFetcher,
      },
      {
        queryKey: "key12",
        queryFn: simpleFetcher,
      },
    ];
    const queriesState = useQueries(queries);

    await flushPromises();

    expect(queriesState).toMatchObject([
      {
        status: "success",
        isLoading: false,
        isFetching: false,
        isStale: true,
      },
      {
        status: "success",
        isLoading: false,
        isFetching: false,
        isStale: true,
      },
    ]);
  });

  test("should reject one of the queries and update reactive state", async () => {
    const queries = [
      {
        queryKey: "key21",
        queryFn: rejectFetcher,
      },
      {
        queryKey: "key22",
        queryFn: simpleFetcher,
      },
    ];
    const queriesState = useQueries(queries);

    await flushPromises();

    expect(queriesState).toMatchObject([
      {
        status: "error",
        isLoading: false,
        isFetching: false,
        isStale: true,
      },
      {
        status: "success",
        isLoading: false,
        isFetching: false,
        isStale: true,
      },
    ]);
  });

  test("should return state for new queries", async () => {
    const queries = reactive([
      {
        queryKey: "key31",
        queryFn: getSimpleFetcherWithReturnData("value31"),
      },
      {
        queryKey: "key32",
        queryFn: getSimpleFetcherWithReturnData("value32"),
      },
      {
        queryKey: "key33",
        queryFn: getSimpleFetcherWithReturnData("value33"),
      },
    ]);
    const queriesState = useQueries(queries);

    await flushPromises();

    queries.splice(
      0,
      queries.length,
      {
        queryKey: "key31",
        queryFn: getSimpleFetcherWithReturnData("value31"),
      },
      {
        queryKey: "key34",
        queryFn: getSimpleFetcherWithReturnData("value34"),
      }
    );

    await flushPromises();
    await flushPromises();

    expect(queriesState.length).toEqual(2);
    expect(queriesState).toMatchObject([
      {
        data: "value31",
        status: "success",
        isLoading: false,
        isFetching: false,
        isStale: true,
      },
      {
        data: "value34",
        status: "success",
        isLoading: false,
        isFetching: false,
        isStale: true,
      },
    ]);
  });

  test("should stop listening to changes on onUnmount", async () => {
    const onUnmountedMock = onUnmounted as jest.MockedFunction<
      typeof onUnmounted
    >;
    onUnmountedMock.mockImplementationOnce((fn) => fn());

    const queries = [
      {
        queryKey: "key41",
        queryFn: simpleFetcher,
      },
      {
        queryKey: "key42",
        queryFn: simpleFetcher,
      },
    ];
    const queriesState = useQueries(queries);
    await flushPromises();

    expect(queriesState).toMatchObject([
      {
        status: "loading",
        isLoading: true,
        isFetching: true,
        isStale: true,
      },
      {
        status: "loading",
        isLoading: true,
        isFetching: true,
        isStale: true,
      },
    ]);
  });
});
