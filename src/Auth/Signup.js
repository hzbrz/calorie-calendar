import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import "../Auth/Signup.css";

class Signup extends Component {

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

  nextPath = (path) => {
    this.props.history.push(path);
  }


  formSubmitHandler = () => {
    fetch("https://carb-api.herokuapp.com/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).then(res => {
      if (res.status === 422) {
        throw new Error(
          "Validation failed."
        );
      }
      if (res.status !== 200 && res.status !== 201) {
        console.error('Creating a Calendar failed!');
      }
      return res.json()
    })
      .then(resData => {
        fetch("https://carb-api.herokuapp.com/calorie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }).then(res => {
          if (res.status === 422) {
            throw new Error(
              "Validation failed."
            );
          }
          if (res.status !== 200 && res.status !== 201) {
            console.error('Creating a Calorie Calendar failed!');
          }
          return res.json()
        })
          .then(calorieData => {
            fetch("https://carb-api.herokuapp.com/user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: this.state.formControls.email.value,
                password: this.state.formControls.password.value,
                calorie: this.state.formControls.name.value,
                calorie_id: calorieData.calorie_id,
                calendar_id: resData.calendar_id
              })
            }).then(res => {
              if (res.status === 422) {
                throw new Error(
                  "Validation failed."
                );
              }
              if (res.status !== 200 && res.status !== 201) {
                console.error('Signup failed');
              }
              return res.json()
            })
              .then(signUpData => {
                console.log(signUpData)
              })
              .catch(err => console.log("SIGNUPUP POST FETCH ", err))
          })
          .catch(err => console.log("CALORIE POST FETCH", err))
      })
      .catch(err => console.log("POST fetch", err))
  }

  render() {
    return (
      <div className="signupForm">
        <h1>Please Sign in With CarbManager email/pass</h1>
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

          <input
            className="input"
            type="text"
            name="name"
            value={this.state.formControls.name.value}
            onChange={this.changeHandler}
            placeholder={"Enter calorie goal"}
          />
        </form>

        <button onClick={this.formSubmitHandler}>
          Submit
        </button>
      </div>

    );
  }

}

export default withRouter(Signup);