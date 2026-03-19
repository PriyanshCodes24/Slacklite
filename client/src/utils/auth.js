export const setAuth = (data) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify.data);
};

export const getUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};
