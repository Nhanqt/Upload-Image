export function paginateResponse(data, total, page, limit) {
  page += 1;
  const lastPage = Math.ceil(total / limit);
  const nextPage = page + 1 > lastPage ? null : page + 1;
  const prevPage = page - 1 < 1 ? null : page - 1;
  const totalPage = Math.ceil(total / limit);
  return {
    statusCode: 'success',
    data: data,
    count: total,
    currentPage: page,
    totalPage: totalPage,
    nextPage: nextPage,
    prevPage: prevPage,
    lastPage: lastPage,
  };
}
