import React from 'react';
import KeyToggle from './KeyToggle';
import { useSelector } from 'global/redux';
import { useDispatch } from 'react-redux';
import { createGroup } from 'modules/draw/shape/group.reducer';
import { deleteDrawings } from 'modules/draw/mixins/delete/delete.reducer';
import uuid from 'uuid';

const KeyTooltips: React.FC = () => {
  const dispatch = useDispatch();

  const isAltPressed = useSelector((s) => s.keyboard.altKey);
  const isShiftPressed = useSelector((s) => s.keyboard.shiftKey);
  const isCmdPressed = useSelector((s) => s.keyboard.cmdKey);
  const isGPressed = useSelector((s) => s.keyboard.gKey);

  const selectedId = useSelector((s) => s.draw.select?.id);
  const selectedShape = useSelector(
    (s) => selectedId && s.draw.shapes[selectedId]
  );
  const isGroupingRectSelected =
    selectedShape && selectedShape.type === 'grouping_rect';

  const isMultiSelecting = useSelector((s) => s.draw.multiSelect);

  const platform = window.navigator.platform;
  const optionOrAlt = platform.includes('Mac') ? 'Option' : 'Alt';
  const cmdOrCtrl = platform.includes('Mac') ? 'Command' : 'Ctrl';

  return (
    <>
      <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
        <KeyToggle
          isToggled={isAltPressed}
          tips={[
            '⌥ + Click to draw a box',
            '⌥ + Click to draw arrow from selected box',
          ]}
        >
          ⌥ [{optionOrAlt}]
        </KeyToggle>
        <KeyToggle
          isToggled={isShiftPressed}
          tips={['⇧ + Click (or Drag) to multi-select']}
        >
          ⇧ [Shift]
        </KeyToggle>
        <KeyToggle
          isToggled={isCmdPressed}
          tips={[
            '⌘ + A to select all',
            '⌘ + Z to undo',
            '⌘ + ⇧ [Shift] + Z to redo',
          ]}
        >
          ⌘ [{cmdOrCtrl}]
        </KeyToggle>
        {isMultiSelecting && (
          <KeyToggle
            onClick={(e) => dispatch(createGroup(uuid.v4()))}
            isToggled={isGPressed}
            tips={[]}
          >
            G [Group]
          </KeyToggle>
        )}
        {selectedId && isGroupingRectSelected && !isMultiSelecting && (
          <KeyToggle
            onClick={(e) => dispatch(deleteDrawings({ ids: [selectedId] }))}
            isToggled={isGPressed}
            tips={[]}
          >
            G [Ungroup]
          </KeyToggle>
        )}
      </div>
    </>
  );
};

export default KeyTooltips;
