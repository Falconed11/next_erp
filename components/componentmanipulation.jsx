const ConditionalComponent = ({ condition, component }) => {
  return condition ? component : <></>;
};

export { ConditionalComponent };
