import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getNoteList } from "@/entities/note/api/noteApi";
import styles from './panels.module.css'
import List from "../NotesList/List";
import { Search } from "@/features/Search";

const PAGE_SIZE = 10;

const Notes = () => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["notesList"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => {
      const start = pageParam * PAGE_SIZE;
      const end = start + PAGE_SIZE;

      return getNoteList(start, end);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }

      return allPages.length;
    },
  });

  const notesList = useMemo(() => {
    return data?.pages.flat() ?? [];
  }, [data]);

  useEffect(() => {
    const el = loadMoreRef.current;

    if (!el) return;
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className={styles.panel_container}>
        <h2 className={styles.title}>Все заметки</h2>
        <div>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.panel_container}>
        <h2 className={styles.title}>Все заметки</h2>
        <div>Не удалось загрузить заметки</div>
      </div>
    );
  }

  return (
    <div className={styles.panel_container}>
      <h2 className={styles.title}>Все заметки</h2>

      <div>
        <Search />
      </div>

      <List list={notesList} />

      <div ref={loadMoreRef} />

      {isFetchingNextPage && (
        <div className={styles.loadingMore}>
          Загрузка ещё...
        </div>
      )}
    </div>
  );
};

export default Notes;