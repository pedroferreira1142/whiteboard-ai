import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNodeAsync, fetchNodesAsync, createSubjectAsync } from '../../redux/whiteboardSlice';
import { AppDispatch, RootState } from '../../redux/store';
import './Toolbar.styles.css';

/**
 * Toolbar Component
 *
 * This component provides a toolbar with buttons to add nodes and subjects.
 * The "Add Node" button creates a new node and refreshes the list of nodes.
 * The "Add Subject" button creates a new subject and is disabled if a subject already exists.
 *
 * @returns {JSX.Element} The rendered Toolbar component.
 */
const Toolbar: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  // Whiteboard ID is hard-coded for now. Replace with a dynamic value if needed.
  const whiteboardId = 1;
  const { subjects } = useSelector((state: RootState) => state.whiteboard);

  /**
   * Handles adding a new node.
   *
   * Creates a new node object with default values, dispatches an action to add the node,
   * and then refreshes the node list by dispatching the fetchNodesAsync action.
   */
  const handleAddNode = async () => {
    const newNode = {
      name: 'New Node',
      prompt: '',
      subject_id: null,
      connections: [],
      interaction_history: [],
      position: { x: 0, y: 0 },
      whiteboard_id: whiteboardId,
      summary: ''
    };

    await dispatch(addNodeAsync(newNode));
    await dispatch(fetchNodesAsync());
  };

  /**
   * Handles adding a new subject.
   *
   * Dispatches an action to create a new subject with default values.
   */
  const handleAddSubject = () => {
    dispatch(
      createSubjectAsync({
        name: 'Subject',
        summary: '',
        whiteboard_id: whiteboardId,
      })
    );
  };

  return (
    <div className="toolbar-container">
      <button onClick={handleAddNode}>+ Node</button>
      <button onClick={handleAddSubject} disabled={subjects.length > 0}>
        + Subject
      </button>
    </div>
  );
};

export default Toolbar;
