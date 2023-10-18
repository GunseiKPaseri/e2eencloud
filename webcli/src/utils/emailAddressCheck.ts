const correctEmailaddr =
  /^[\w+-]+(.[\w+-]+)*@([\dA-Za-z][\dA-Za-z-]*[\dA-Za-z]*\.)+[A-Za-z]{2,}$/;

export const isEmailCorrect = (email: string) => correctEmailaddr.test(email);
