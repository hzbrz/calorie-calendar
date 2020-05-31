import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import "../Auth/Signup.css";

class Login extends Component {

  constructor() {
    super();
    this.state = {
      formControls: {
        email: {
          value: ''
        },
        password: {
          value: ''
        },
        name: {
          value: ''
        }
      }
    }
  }

  changeHandler = event => {

    const name = event.target.name;
    const value = event.target.value;

    this.setState({
      formControls: {
        ...this.state.formControls,
        [name]: {
          ...this.state.formControls[name],
          value
        }
      }
    });
  }

  nextPath = (path, state) => {
    this.props.history.push(path, state);
  }


  formSubmitHandler = () => {
    fetch("https://carb-api.herokuapp.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: this.state.formControls.email.value,
        password: this.state.formControls.password.value,
      })
    }).then(res => {
      console.log(res.status)
      if (res.status === 422) {
        throw new Error(
          "Validation failed."
        );
      }
      if (res.status !== 200 && res.status !== 201) {
        console.error('Login failed!');
      }
      return res.json()
    })
      .then(resData => {
        console.log("FROM LOGIN PAGE: ", resData)
        if (resData.user_data === "redirect") { this.nextPath("/signup") }
        else { 
          this.nextPath("/calendar", { "calendar_id": resData.user_data["calendar_id"], 
                                        "calorie_id": resData.user_data["calorie_id"],
                                        "calorie": resData.user_data["calorie"] }
                      ) 
        }
      })
      .catch(err => console.log("LOGIN POST FAILED", err))
  }

  render() {
    return (
      <div className="signupForm">
        <h1>Please Sign in: </h1>
        <form>
          <input
            className="input"
            type="email"
            name="email"
            value={this.state.formControls.email.value}
            onChange={this.changeHandler}
            placeholder={"Carbmanager email"}
          />
          <br />

          <input
            className="input"
            type="password"
            name="password"
            value={this.state.formControls.password.value}
            onChange={this.changeHandler}
            placeholder={"Carbmanager password"}
          />
          <br />
        </form>

        <button onClick={this.formSubmitHandler}>
          Submit
        </button>
      </div>

    );
  }

}

export default withRouter(Login);