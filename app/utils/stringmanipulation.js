const removePrefixIfMatchIgnoreCase = (str, prefix2Remove) => {
  return str.replace(new RegExp("^" + prefix2Remove, "i"), "");
};

module.exports = { removePrefixIfMatchIgnoreCase };
