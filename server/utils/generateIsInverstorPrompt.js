const generateIsInvestorPrompt = (animal) => {
  return `Do the following email addresses
  belong to vc firms?\nregina@rechargecapital.com, cole@curryupnow.com,
  steve@semrush.com, toby@goldmansachs.com, vj@gmail.com\n\nYes, No, No, Yes,
  No\n##\nDo the following email addresses belong to vc firms?\n${animal}\n`;
};

module.exports = generateIsInvestorPrompt;
