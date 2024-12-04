const MyChip = ({ text, theme }) => {
  console.log(text, theme);
  if (theme == "danger")
    return (
      <span className="bg-red-600 text-white p-1 rounded font-bold">
        {text}
      </span>
    );
  if (theme == "success")
    return (
      <span className="bg-green-400 text-white p-1 rounded font-bold">
        {text}
      </span>
    );
};

export { MyChip };
