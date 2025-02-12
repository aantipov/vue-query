Dependent (or serial) queries depend on previous ones to finish before they can execute. To achieve this, it's as easy as using the `enabled` option to tell a query when it is ready to run:

```js
// Get the user
const { data: user } = useQuery(["user", email], getUserByEmail);

const userId = computed(() => user.value?.id);
const enabled = computed(() => !!user.value?.id);

// Then get the user's projects
const { isIdle, data: projects } = useQuery(
  ["projects", userId],
  () => getProjectsByUser(userId.value),
  {
    enabled, // The query will not execute until the userId exists
  }
);

// isIdle will be `true` until `enabled` is true and the query begins to fetch.
// It will then go to the `isLoading` stage and hopefully the `isSuccess` stage :)
```
