import { getApiPath } from "./apiconfig";

const api_path = getApiPath();

const rolesCheck = (roles, peran) => {
  return roles.includes(peran);
};

const updateSwitch = async (
  switchValue,
  currentValue,
  apiEndPoint,
  method,
  data,
  referenceData
) => {
  if (switchValue === currentValue) return;
  const res = await fetch(`${api_path}${apiEndPoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  // if (res.status == 400) return alert(json.message);
  //return alert(json.message);
  referenceData.forEach((data) => data.mutate());
};

export { rolesCheck, updateSwitch };
