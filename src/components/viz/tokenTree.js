import React, { useRef, useState, useEffect } from "react";
import * as d3_base from 'd3'
import * as sankey from "d3-sankey"
const d3 = Object.assign({}, d3_base, sankey);
const log = console.log

const size = {
  width: 1400,
  height: 38000
};

class TokenTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: this.props.data.nodes,
      links: this.props.data.links
  	}
  }

  render() {

    const Link = React.forwardRef(( props, ref ) => {
      const link = sankey.sankeyLinkHorizontal();

      return (
        <>
          <path
            d={link(props.data)}
            id={props.data.index}
            ref={ref}
            fill={"none"}
            stroke={"#C94742"}
            strokeOpacity={0.2}
            strokeWidth={props.width}
          />
        </>
      );
    });

    const Marker = ({ data, hoveredPaths, index, x0, x1, y0, y1, name, output }) => {
      if (y0 === y1) {
        y0 = y0+2
        y1 = y1+2
      }

      return (
        <div
          className={"token"}
          style={{
            left: x0,
            top: y0,
            height: y1-y0
          }}
          id={name}
        >
          <div className={"name"}>
            {name}
          </div>
          <div className={"value"}>
            {output}
          </div>
        </div>
      );
    };

    return (
      <div className={"token-tree-container"}>
        <svg width={size.width} height={size.height}>
          <g>
            {this.state.links.map((d, i) => (
              <Link
                key={i}
                data={d}
                width={2}
                hover={d.hover}
              />
            ))}
          </g>
        </svg>
        {this.state.nodes.map((d, i) => (
          <Marker
            key={i}
            index={d.name}
            x0={d.x0}
            x1={d.x1}
            y0={d.y0}
            y1={d.y1}
            name={d.name}
            output={d.output}
          />
        ))}
      </div>
    )
  }
};

export default TokenTree;
