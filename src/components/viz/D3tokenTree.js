import React, { useRef, useState, useEffect } from "react";
import * as d3_base from 'd3'
import * as sankey from "d3-sankey"
const d3 = Object.assign({}, d3_base, sankey);
const log = console.log

const TokenTree = props => {
  const link = sankey.sankeyLinkHorizontal();
  const ref = useRef(null);
  const svg = d3.select(ref.current);
  const [empty, setEmpty] = useState(false);

  // svg.append('g')
  //   .attr('class', "reset")
  //   .append('rect')
  //   .attr('x', 0)
  //   .attr('y', 0)
  //   .attr("height", props.height)
  //   .attr("width", props.width)
  //   .attr("fill", "transparent")
  //   .on("click", reset);

  useEffect(
    () => {
      reset(false)
      setEmpty(true)

      if (props.data.nodes.length > 0 && props.data.links.length > 0 && ref.current) {
        let data = sankify(props.data.nodes, props.data.links, props.height, props.width)
        setEmpty(false)

        // log(data)

        // Iniatilize Paths
        const updatePath = svg.selectAll('g.path').data(data.links);
        updatePath.exit().remove();

        let path = updatePath
          .enter()
          .append('g')
          .attr('class', 'path');

        path.append("path")
          .attr("class", "link")
          .attr("id", link => link.index)
          .attr("d", link)
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-opacity", 0.08)
          .attr("stroke-width", 2);

        path.append("path")
          .attr("class", "animated-link")
          .attr("id", link => link.index)
          .attr("d", link)
          .attr("fill", "none")
          .attr("stroke", "#C94742")
          .attr("stroke-opacity", 0.2)
          .attr("stroke-width", 2)
          .each(function(d) { d.totalLength = this.getTotalLength(); })
            .attr("stroke-dasharray", function(d) { return d.totalLength + " " + d.totalLength; })
            .attr("stroke-dashoffset", function(d) { return d.totalLength; });

        updatePath.select("path.link")
          .attr("id", link => link.index)
          .attr("d", link);

        updatePath.select("path.animated-link")
          .attr("id", link => link.index)
          .attr("d", link)
          .each(function(d) { d.totalLength = this.getTotalLength(); })
            .attr("stroke-dasharray", function(d) { return d.totalLength + " " + d.totalLength; })
            .attr("stroke-dashoffset", function(d) { return d.totalLength; });

        // Iniatilize Cards
        const updateCard = svg.selectAll('g.card').data(data.nodes);
        updateCard.exit().remove();

        // Enter new D3 elements
        let card = updateCard
          .enter()
          .append('g')
          .attr('class', 'card')
          .attr('id', node => {
            return 'card-' + node.index
          })
          .attr('data-toggle', "false")
          .on("click", node => {
            toggleClick(node.target.__data__);
          });

        // Card Background
        card.append('rect')
          .attr('class', 'card')
          .attr('id', node => {
            return 'rect-' + node.index
          })
          .attr("height", 46)
          .attr("width", 320)
          .attr("fill", "#41434d")
          .attr("stroke", "#41434d")
          .attr("stroke-width", 2)
          .attr("rx", 6)
          .attr("ry", 6)
          .attr("x", node => node.x0)
          .attr("y", node => node.y1 + (((node.y0 - node.y1) - (46))/2));

        // Token Name
        card.append("text")
          .attr("class", "name")
          .attr("fill", "white")
          .attr("alignment-baseline", "middle")
          .attr("font-size", 16)
          .attr("font-weight", 600)
          .attr("text-anchor", "start")
          .attr("opacity", 0.8)
          .attr("x", node => node.x0 + 14)
          .attr("y", node => (node.y0+node.y1)/2 - 8)
          .text(node => {
            if (node.name.length > 38) {
              return node.name.substring(0, 38 - 3) + "..."
            } else {
              return node.name
            }
          });

        // Token Name
        card.append("text")
          .attr("class", "value")
          .attr("fill", "white")
          .attr("alignment-baseline", "middle")
          .attr("font-size", 14)
          .attr("font-weight", 400)
          .attr("text-anchor", "start")
          .attr("opacity", 0.6)
          .attr("x", node => node.x0 + 14)
          .attr("y", node => (node.y0+node.y1)/2 + 12)
          .text(node => {
            if (node.output.length > 36) {
              return node.output.substring(0, 40 - 3) + "..."
            } else {
              return node.output
            }
          });

        card.append('circle')
          .attr("class", "marker-one")
          .attr("r", 6)
          .attr("cy", node => (node.y0 + node.y1)/2)
          .attr("fill", node => {
            if (node.sourceLinks.length === 0 & node.targetLinks.length === 0) {
              return "transparent"
            } else {
              return "#C94742"
            }
          })
          .attr("cx", node => {
            if (node.sourceLinks.length !== 0 & node.targetLinks.length === 0) {
              return node.x1
            } else {
              return node.x0
            }
          });

        card.append('circle')
          .attr("class", "marker-two")
          .attr("r", 6)
          .attr("cy", node => (node.y0 + node.y1)/2)
          .attr("fill", node => {
            if ((node.sourceLinks.length === 0 & node.targetLinks.length === 0) || (node.sourceLinks.length === 0 & node.targetLinks.length !== 0) || (node.sourceLinks.length !== 0 & node.targetLinks.length === 0)) {
              return "transparent"
            } else {
              return "#C94742"
            }
          })
          .attr("cx", node => {
            if (node.sourceLinks.length !== 0 & node.targetLinks.length !== 0) {
              return node.x1
            } else {
              return node.x1
            }
          });

        updateCard.select("g.card")
          .transition()
          .attr('data-toggle', "false")
          .attr('class', 'card');

        updateCard.select("rect.card")
          .transition()
          .duration(250)
          .ease(d3.easeLinear)
          .attr("x", node => node.x0)
          .attr("y", node => node.y1 + (((node.y0 - node.y1) - (46))/2));

        updateCard.select("text.name")
          .transition()
          .duration(250)
          .ease(d3.easeLinear)
          .attr("x", node => node.x0 + 14)
          .attr("y", node => (node.y0+node.y1)/2 - 8)
          .text(node => {
            if (node.name.length > 38) {
              return node.name.substring(0, 38 - 3) + "..."
            } else {
              return node.name
            }
          });

        updateCard.select("text.value")
          .transition()
          .duration(250)
          .ease(d3.easeLinear)
          .attr("x", node => node.x0 + 14)
          .attr("y", node => (node.y0+node.y1)/2 + 12)
          .text(node => {
            if (node.output.length > 36) {
              return node.output.substring(0, 40 - 3) + "..."
            } else {
              return node.output
            }
          });

        updateCard.select("circle.marker-one")
          .transition()
          .duration(250)
          .ease(d3.easeLinear)
          .attr("cy", node => (node.y0 + node.y1)/2)
          .attr("fill", node => {
            if (node.sourceLinks.length === 0 & node.targetLinks.length === 0) {
              return "transparent"
            } else {
              return "#C94742"
            }
          })
          .attr("cx", node => {
            if (node.sourceLinks.length !== 0 & node.targetLinks.length === 0) {
              return node.x1
            } else {
              return node.x0
            }
          });

        updateCard.select("circle.marker-two")
          .transition()
          .duration(250)
          .ease(d3.easeLinear)
          .attr("cy", node => (node.y0 + node.y1)/2)
          .attr("fill", node => {
            if ((node.sourceLinks.length === 0 & node.targetLinks.length === 0) || (node.sourceLinks.length === 0 & node.targetLinks.length !== 0) || (node.sourceLinks.length !== 0 & node.targetLinks.length === 0)) {
              return "transparent"
            } else {
              return "#C94742"
            }
          })
          .attr("cx", node => {
            if (node.sourceLinks.length !== 0 & node.targetLinks.length !== 0) {
              return node.x1
            } else {
              return node.x1
            }
          });

      }
    },
    [props.data, props.width, props.height, props.query]
  )

  // Interactive Functions
  function toggleClick(node) {
    let thisCard = "#card-" + node.index
    let card = svg.select(thisCard)
    let toggle = card.attr("data-toggle")

    if (toggle === "false") {
      reset();
      fadeCards(node);
      handleDirection(node);

      card.attr("data-toggle", "true")
    } else {
      reset();

      card.attr("data-toggle", "false")
    }
  }

  function fadeCards(node) {
    svg.selectAll("g.card").attr("class", "card dimmed")
    let thisCard = "#card-" + node.index
    svg.select(thisCard).attr("class", "card active")
  }

  function handleDirection(node) {
    let forwardLinks = svg.selectAll("path.animated-link").filter((link) => {
      return node.sourceLinks.indexOf(link) !== -1
    })

    let backwardLinks = svg.selectAll("path.animated-link").filter((link) => {
      return node.targetLinks.indexOf(link) !== -1
    })

    if (!forwardLinks.empty()) {
      branchAnimateForward(node)
    }

    if (!backwardLinks.empty()) {
      branchAnimateBackward(node)
    }

    let thisRect = "#rect-" + node.index
    let rect = svg.select(thisRect)

    let thisCard = "#card-" + node.index
    let card = svg.select(thisCard)

    card.attr("class", "card active")
    rect.transition()
      .duration(250)
      .ease(d3.easeLinear)
      .attr("stroke", "#C94742");
  }

  function branchAnimateForward(node) {
    let forwardLinks = svg.selectAll("path.animated-link").filter((link) => {
      return node.sourceLinks.indexOf(link) !== -1
    })

    let nextNodes = [];

    forwardLinks.each((link) => {
      nextNodes.push(link.target);
    });

    forwardLinks.attr("stroke-opacity", 0.8)
      .transition()
      .duration(250)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0)
      .on("end", () => {
        nextNodes.forEach((node) => {
          branchAnimateForward(node);
        });
      });

    let thisRect = "#rect-" + node.index
    let rect = svg.select(thisRect)

    let thisCard = "#card-" + node.index
    let card = svg.select(thisCard)

    card.attr("class", "card active")
    rect.transition()
      .duration(250)
      .ease(d3.easeLinear)
      .attr("stroke", "#C94742");
  }

  function branchAnimateBackward(node) {
    let backwardLinks = svg.selectAll("path.animated-link").filter((link) => {
      return node.targetLinks.indexOf(link) !== -1
    })

    let prevNodes = [];

    let thisRect = "#rect-" + node.index
    let rect = svg.select(thisRect)

    let thisCard = "#card-" + node.index
    let card = svg.select(thisCard)

    card.attr("class", "card active")
    rect.transition()
      .duration(250)
      .ease(d3.easeLinear)
      .attr("stroke", "#C94742");

    backwardLinks.each((link) => {
      prevNodes.push(link.source);
    });

    backwardLinks.attr("stroke-opacity", 0.8)
      .transition()
      .duration(250)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", function(d) { return d.totalLength*2 })
      .on("end", () => {
        prevNodes.forEach((node) => {
          branchAnimateBackward(node);
        });
      });
  }

  function reset(click = true) {
    svg.selectAll("g.card")
      .attr("class", "card")
      .attr("data-toggle", "false")

    if (click) {
      svg.selectAll("circle")
        .transition()
        .duration(250)
        .ease(d3.easeLinear)
        .attr("opacity", 1);
      svg.selectAll("rect.card")
        .transition()
        .duration(250)
        .ease(d3.easeLinear)
        .attr("stroke", "#41434d");
      svg.selectAll("path.animated-link")
        .transition()
        .duration(250)
        .ease(d3.easeLinear)
        .attr("stroke-opactiy", 0)
        .each(function(d) { d.totalLength = this.getTotalLength(); })
          .attr("stroke-dasharray", function(d) { return d.totalLength + " " + d.totalLength; })
          .attr("stroke-dashoffset", function(d) { return d.totalLength; });
    } else {
      svg.selectAll("circle")
        // .transition()
        // .duration(250)
        // .ease(d3.easeLinear)
        .attr("opacity", 1);
      svg.selectAll("rect.card")
        // .transition()
        // .duration(250)
        // .ease(d3.easeLinear)
        .attr("stroke", "#41434d");
      svg.selectAll("path.animated-link")
        // .transition()
        // .duration(250)
        // .ease(d3.easeLinear)
        .attr("stroke-opactiy", 0)
        .each(function(d) { d.totalLength = this.getTotalLength(); })
          .attr("stroke-dasharray", function(d) { return d.totalLength + " " + d.totalLength; })
          .attr("stroke-dashoffset", function(d) { return d.totalLength; });
    }
  }

  return (
    <div className="token-tree-container">
      <div className={"search-empty-state " + (!empty ? 'hide' : 'show')}>
        No tokens found for {`'` + props.query + `'`}. Please search again!
      </div>
      <svg
        width={props.width}
        height={props.height}
        ref={ref}
        className={(empty ? 'hide' : 'show')}
      >
        <rect
          className={"reset"}
          x={0}
          y={0}
          width={props.width}
          height={props.height}
          fill={"transparent"}
          onClick={reset}
        />
    </svg>
    </div>
  );
}

const sankify = (nodes, links, height, width) => {
  const sankey = d3
    .sankey()
    .nodeId(d => d.name)
    .nodeAlign(d3.sankeyCenter)
    .nodeWidth(8)
    .nodePadding(20)
    .extent([[24, 24], [width-320, height-24]]);

  const centerTargetLinks = links => {
    for (let i = 0; i < links.length; i++) {
      links[i].source.visited = false
    }

    for (let i = 0; i < links.length; i++) {
      links[i].y0 = (links[i].source.y0 + links[i].source.y1) / 2
      links[i].y1 = (links[i].target.y0 + links[i].target.y1) / 2
      links[i].source.y0 = links[i].y0 - 2
      links[i].source.y1 = links[i].y0 + 2
      links[i].target.y0 = links[i].y1 - 2
      links[i].target.y1 = links[i].y1 + 2

      if (links[i].source.visited === false) {
        links[i].source.x1 = links[i].source.x1 + 312
        links[i].source.visited = true
      }
    }

    return links
  }

  let data = sankey({nodes, links})
  nodes = data.nodes
  links = centerTargetLinks(data.links)

  return ({nodes, links})
}

export default TokenTree;
