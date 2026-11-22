# `optimize` — Performance & Resource Efficiency

Measure or reason from concrete bottlenecks before optimizing. Never trade correctness or readability for micro-optimizations on cold paths.

## High-Impact Targets

1. **Database & Query Patterns:** Eliminate N+1 queries (batch/join/DataLoader), add missing indexes for filter/sort columns, select only needed columns, and use cursor/keyset pagination for large tables.
2. **I/O & Concurrency:** Parallelize independent async calls (`Promise.all` / `asyncio.gather` / `errgroup`) with bounded concurrency; reuse HTTP/DB connection pools instead of creating per-request clients.
3. **Memory & Streaming:** Stream large files, exports, and LLM/HTTP payloads instead of buffering entire blobs in RAM; bound in-memory caches with max size + TTL.
4. **Algorithmic Complexity:** Replace $O(n^2)$ nested array `.find`/`.includes` lookups with `Map`/`Set` indexing.
5. **Caching:** Cache only stable/expensive reads with explicit invalidation or short TTLs; never cache auth decisions or unkeyed per-user data.
