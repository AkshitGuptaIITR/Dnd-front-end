import React, { Component } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import { Table } from "react-bootstrap";

// fake data generator
const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k + offset}`,
    content: `item ${k + offset}`,
  }));

const alphabet = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
].map((k) => ({
  id: `${k}`,
  content: k,
}));

const check = ["<", ">"].map((k) => ({
  id: `item-${k}`,
  content: k,
}));

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${0}px 0`,
  // display: "flex",
  width: "100px",
  justifyContent: "space-between",
  // change background colour if dragging
  // background: isDragging ? "lightgreen" : "grey",
  // width: 250,
  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  // padding: grid,
  // width: 250,
  // marginTop: 250,
  // display: "flex",
});

class Content extends Component {
  arr = [""];

  value = this.arr.map((k) => ({
    id: `items-${k}`,
    content: k,
  }));

  state = {
    items: alphabet,
    selected: getItems(0),
    sign: check,
    input: this.value,
    show: false,
    numeric: null,
    result: [],
    isResult: false,
  };

  handleClose = () => {
    this.setState({
      show: !this.state.show,
    });
  };

  handleDone = () => {
    let status = this.state.selected;
    status[2].content = "";
    this.setState({ selected: status });
    this.setState({
      show: !this.state.show,
      isResult: !this.state.isResult,
      result: [],
      items: alphabet,
      selected: getItems(0),
      sign: check,
      input: this.value,
    });
  };

  handleRequest = () => {
    let comp = "";
    console.log(this.state.selected[2].content);
    if (this.state.selected[1].content === ">") {
      comp = "greater";
    }
    let url = `https://allianz-exports-node-app.herokuapp.com/api/result?letter=${this.state.selected[0].content}&value=${this.state.selected[2].content}&method=${comp}`;
    console.log(url);
    axios
      .get(`${url}`)
      .then((req) => {
        this.setState({
          isResult: !this.state.isResult,
          show: !this.state.show,
          result: req.data.result,
        });
      })
      .catch((err) => console.log(err));
  };

  /**
   * A semi-generic way to handle multiple lists. Matches
   * the IDs of the droppable container to the names of the
   * source arrays stored in the state.
   */

  id2List = {
    droppable: "items",
    droppable2: "selected",
    droppable3: "sign",
    droppable4: "input",
  };

  getList = (id) => this.state[this.id2List[id]];

  onDragEnd = (result) => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const items = reorder(
        this.getList(source.droppableId),
        source.index,
        destination.index
      );

      let state = { items };

      if (source.droppableId === "droppable2") {
        state = { selected: items };
      }

      if (source.droppableId === "droppable3") {
        state = { sign: items };
      }

      if (state.droppableId === "droppable4") {
        state = { input: items };
      }

      this.setState(state);
    } else {
      const result = move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination
      );
      this.setState({
        items: result.droppable || this.state.items || [],
        selected: result.droppable2 || this.state.selected || [],
        sign: result.droppable3 || this.state.sign || [],
        input: result.droppable4 || this.state.input || [],
      });
    }
  };

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    return (
      <>
        <div className="wrapper">
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div
                  className="column start"
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {this.state.items.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          className="object"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(snapshot.isDragging, {
                            ...provided.draggableProps.style,
                            // transform: "none",
                          })}
                        >
                          {item.content}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <div className="content">
              <Droppable droppableId="droppable3">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    className="column row"
                    style={getListStyle(snapshot.isDraggingOver)}
                  >
                    {this.state.sign.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            className="object col"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}
                          >
                            {item.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              <Droppable droppableId="droppable4">
                {(provided, snapshot) => (
                  <div
                    className="column row"
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                  >
                    {this.state.input.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            className="object colour"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}
                          >
                            {item.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            <Droppable droppableId="droppable2">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  className="column result"
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {this.state.selected.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          className="object"
                          onDoubleClick={
                            index === 2
                              ? () => this.setState({ show: true })
                              : null
                          }
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          {item.content}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <div className="btnWrapper">
            <Button className="btn" onClick={this.handleRequest}>
              Submit
            </Button>
          </div>
        </div>
        <Modal
          show={this.state.show}
          onHide={this.state.isResult ? this.handleDone : this.handleClose}
        >
          <Modal.Header>
            <Modal.Title>
              {this.state.isResult ? "Result" : "Enter Value"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.isResult ? (
              this.state.result.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Alphabet</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.result.map((data, idx) => {
                      return (
                        <tr>
                          {/* {console.log(data)} */}
                          <td>{idx + 1}</td>
                          <td>{data.letter}</td>
                          <td>{data.numeric}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : (
                <div>No Result Found </div>
              )
            ) : (
              <input
                style={{ width: "100%" }}
                type="text"
                onChange={(e) => {
                  this.setState({ numeric: e.target.value });
                }}
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={
                this.state.isResult
                  ? this.handleDone
                  : () => {
                      let status = this.state.selected;
                      status[2].content = this.state.numeric;
                      this.setState({
                        selected: status,
                        show: !this.state.show,
                      });
                    }
              }
            >
              {this.state.isResult ? "Done" : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

// Put the things into the DOM!
export default Content;
