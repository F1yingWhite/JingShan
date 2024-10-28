<template>
  <div class="login-container">
    <div class="login-box">
      <img src="../assets/buddha.png" alt="logo" />
			<h2>Login</h2>
			<form @submit.prevent="handleLogin" class="login-table">
        <div class="form-group">
          <label for="userName">User Name</label>
          <input type="text" id="userName" v-model="userName" placeholder="Enter your user name." required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" placeholder="Enter your password." required />
        </div>
				<div class="button-container">
					<button type="submit">Login</button>
				</div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      userName: '',
      password: ''
    };
  },
  methods: {
    handleLogin() {
      console.log('Logging in with:', this.userName, this.password);
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #faf8f5;
}

.login-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 5px;
  width: 360px; /* 调整宽度 */
  height: 600px; /* 调整高度 */
}

.login-box img {
  margin-bottom: 20px;
	max-height: 50%;
  max-width: 100%;  /* 确保图片最大宽度不超过容器 */
  height: auto;
}

.login-table {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 400px; /* 调整宽度 */
}

.form-group {
  width: 280px; /* 固定宽度 */
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%; /* 确保输入框宽度填满 */
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.button-container {
  width: 100%;
  display: flex;
  justify-content: center; /* 确保按钮居中 */
  margin-top: 20px;
}

button {
  padding: 10px;
  border: none;
  background-color: #8b6600;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  padding: 10px 20px; /* 调整按钮宽度 */
}

button:hover {
  background-color: #cc9900;
}
</style>