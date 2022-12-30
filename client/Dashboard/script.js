let user = null;
const userName = document.querySelector('nav > h2');
const userImg = document.querySelector('nav > img');

window.onload = async () => {
  try {
    const resp = await fetch('/api/auth/profile');
    const { data } = await resp.json();

    if (!data) window.location.href = '/login';

    user = data;

    userName.innerText = `Hi, ${user.name}`;
    userImg.setAttribute('src', user.picture);
  } catch (error) {
    alert(error.message);
  }
};
