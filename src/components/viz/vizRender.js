import React, { Component } from "react"
import TokenTree from "./D3tokenTree"
import tokenData from "../../data/rei-cedar.json"
import _ from "lodash"
const log = console.log

const size = {
  width: 1400,
  height: 38000
};

class VizRender extends Component {
  constructor(props) {
    super(props)
    this.state = {
      query: ``,
      results: ({nodes: [], links: []}),
    }
  }

  componentDidMount() {
    this.setState(() => {
      return {
        results: this.createTokenTree(tokenData, "")
      }
    });
  }

  render() {
    const { onKeyDown } = this;
    return (
      <>
        <div className={"search-field"}>
          <h3>Search for tokens</h3>
          <input id="search-input" type="text"
            onChange={this.fireSearch}
            onKeyDown={onKeyDown}
            placeholder="Search"
            autoComplete="off" />
        </div>

        <TokenTree data={this.state.results} width={size.width} height={this.state.results.nodes.length*46} query={this.state.query} />
      </>
    )
  }

  fireSearch = evt => {
    const query = evt.target.value
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.search(query), 250)
  }

  search = query => {
    this.setState({
      query,
      results: this.createTokenTree(tokenData, query)
    })
  }

  createTokenTree = (obj, search = "") => {
    let origNodes = []
    let links = []

    const processTokens = obj => {
      if (typeof obj === 'object') {
        if (obj.hasOwnProperty('value')) {
          origNodes.push(obj)
        } else {
          for(var name in obj) {
            if(obj.hasOwnProperty(name)) {
              processTokens(obj[name]);
            }
          }
        }
      }
    }

    const createMapping = str => {
      str = str.toString().split(" ").filter(function(item) {
        return item.includes("{")
      }).map(str => (str.replace(/[{}]/g, "").split('.').slice(0,-1).join('-')))

      str = [...new Set(str)];

      for (var i = 0; i < str.length; i++) {
        if (str[i][0] === "-") {
          str[i] = str[i].substring(1)
        }
      }

      return str
    }

    processTokens(obj)

    origNodes = origNodes.map((item, index) => ({
      name: item.name.split("-").slice(1).join("-"),
      output: item.value,
      mapping: createMapping(item.original.value)
    }))

    let nodes = origNodes;
    let mappedNodes = [];

    if (search.length > 0) {
      nodes = origNodes.filter(node => node.name.includes(search));

      for (let i=0; i < origNodes.length; i++) {
        if (origNodes[i].mapping.length > 0) {
          for (let j = 0; j < origNodes[i].mapping.length; j++) {
            if (origNodes[i].mapping[j].includes(search)) {
              mappedNodes.push(origNodes[i])
            }
          }
        }
      }

      for (let i=0; i < origNodes.length; i++) {
        if (origNodes[i].mapping.length > 0) {
          for (let j = 0; j < mappedNodes.length; j++) {
            if (origNodes[i].mapping.includes(mappedNodes[j].name)) {
              mappedNodes.push(origNodes[i])
            }
          }
        }
      }

      nodes = _.union(nodes, mappedNodes)

      let length = nodes.length
      for (let i=0; i < length; i++) {
        if (nodes[i].mapping.length > 0) {
          for (let j = 0; j < nodes[i].mapping.length; j++) {
            let temp = nodes.filter(node => node.name === nodes[i].mapping[j]);
            if (temp.length === 0) {
              let toAdd = origNodes.filter(node => node.name === nodes[i].mapping[j]);
              nodes.push(toAdd[0])
              length++
            }
          }
        }
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].mapping.length > 0) {
        for (let j = 0; j < nodes[i].mapping.length; j++) {
          links.push({
            source: nodes[i].mapping[j],
            target: nodes[i].name,
            value: 1
          })
        }
      }
    }

    return ({nodes, links})
  }
}

export default VizRender
