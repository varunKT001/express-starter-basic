window.onload = async () => {
  try {
    const resp = await fetch('/api/auth/profile');
    const { data } = await resp.json();
    if (data) window.location.href = '/dashboard';
  } catch (error) {
    alert(error.message);
  }
};
