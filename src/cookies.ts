function getCookie(key: string) {
  const keyEQ = `${key}=`;
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(keyEQ) === 0)
      return cookie.substring(keyEQ.length, cookie.length);
  }

  return null;
}

export { getCookie };
