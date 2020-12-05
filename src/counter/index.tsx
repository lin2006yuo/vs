import * as React from "react"
import { Component } from "react"
import { debounce } from "./decorator"
import { sequentialize, throttle } from "./decorator2"

export interface CounterProps {}

export interface CounterState {}

class Counter extends React.Component<CounterProps, CounterState> {
  state = {
    de_counter: 1,
    th_counter: 1,
    sequantialize: 2
  }

  count = 1
  timer: NodeJS.Timeout = null!

  @debounce(1000)
  de_plus() {
    this.setState({
      de_counter: this.state.de_counter + 1
    })
  }

  @throttle
  th_plus() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.setState({
          th_counter: this.state.th_counter + 1
        })
        resolve("")
      }, 1000)
    })
  }

  @sequentialize
  seq() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.setState({
          sequantialize: this.state.sequantialize + 1
        })
        resolve("")
      }, 2000)
    })
  }

  my() {
    if (this.timer) return
    this.timer = setTimeout(() => {
      this.count++
      clearTimeout(this.timer)
      this.timer = null!
    }, 1000)
  }

  render() {
    return (
      <div>
        <section>
          <div>{this.state.de_counter}</div>
          <button onClick={this.de_plus.bind(this)}>debounce +1</button>
        </section>
        <section>
          <div>{this.state.th_counter}</div>
          <button onClick={this.th_plus.bind(this)}>throttle +1</button>
        </section>
        <section>
          <div>{this.state.sequantialize}</div>
          <button onClick={this.seq.bind(this)}>seq +1</button>
        </section>
        <section>
          <button onClick={this.my.bind(this)}>my</button>
        </section>
      </div>
    )
  }
}

export default Counter
