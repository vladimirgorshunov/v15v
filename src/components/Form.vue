<template>
  <form autocomplete="off" @submit.prevent="handleSubmit">
    <label for="email">Email</label>
    <input id="email" name="email" type="text" v-model="user.email" required>

    <label for="name">Full name</label>
    <input id="name" name="name" type="text" v-model="user.name" required>

    <label for="password">Password</label>
    <input id="password" name="password" type="password" v-model="user.password" required>
    <button type="submit" :disabled="isLoading">
      {{isLoading ? ' ' : 'Enter'}}
    </button>
  </form>
</template>

<script>
  export default {
    name: 'Form',
    props: {
      'user': Object,
      'isLoading': Boolean,
      'handleSubmit': Function
    }
  }
</script>

<style scoped>
  p, input, button {
    color: #303030;
    width: 24.5rem;
    font-size: 1.0625rem;
    font-family: Georgia, serif;
    line-height: 1.455;
    letter-spacing: 0.1px;
    word-spacing: -0.25px;
  }

  p a {
    color: #303030;
    text-decoration: underline;
  }

  .wf-active p,
  .wf-active input,
  .wf-active button {
    font-family: 'pt-serif', serif;
  }

  form {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    display: flex;
    flex-direction: column;
    width: 432px;
    margin: 0 auto;
  }

  label {
    margin-bottom: 8px;
  }

  input {
    margin-bottom: 16px;
    line-height: 40px;
    font-size: 16px;
    padding: 0 16px;
    outline: none;
    box-shadow: none;
    background-color: #fff;
    color: #303030;
    border: 1px solid #575757;
    width: 100%;
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  textarea:-webkit-autofill,
  textarea:-webkit-autofill:hover,
  textarea:-webkit-autofill:focus,
  select:-webkit-autofill,
  select:-webkit-autofill:hover,
  select:-webkit-autofill:focus {
    -webkit-text-fill-color: #303030;
  }

  input:focus {
    outline: none;
    border: 1px solid rgba(48, 48, 48, 0.9);
  }

  button {
    border: 0;
    line-height: 40px;
    min-height: 43px;
    display: inline-block;
    color: #fff;
    max-width: 168px;
    cursor: pointer;
    background-color: rgba(48, 48, 48, 1);
  }

  button:disabled, button:disabled:hover {
    background-color: #a2a2a2;
    cursor: default;
  }

  button:hover {
    background-color: #575757;
  }
</style>
