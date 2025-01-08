const ConditionalComponent = ({ condition, component }) => {
  return condition ? component : <></>;
};

const AuthorizationComponent = ({ roles, user, component }) => {
  return roles.includes(user.peran) ? component : <></>;
};

export { ConditionalComponent, AuthorizationComponent };
