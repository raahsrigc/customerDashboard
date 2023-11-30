export const generateQueryString = queryObject => {
  let queryString = '';

  if (queryObject && queryObject.pagination) {
    queryString += `limit=${
      queryObject.pagination.pageSize
    }&offset=${queryObject.pagination.pageSize *
    (queryObject.pagination.current - 1)}`;
  }

  if (queryObject && queryObject.sort && queryObject.sort.by) {
    queryString += `&sortField=${queryObject.sort.by}&sortOrder=${
      queryObject.sort.order
    }`;
  }

  if (queryObject && queryObject.categories && queryObject.categories.length) {
    queryString += `&categories=${encodeURIComponent(JSON.stringify(queryObject.categories))}`;
  }

  if (queryObject && queryObject.max) {
    queryString += `&min=${queryObject.min || 0}&max=${queryObject.max}`;
  }

  return queryString;
};
