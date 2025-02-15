import React from 'react'

import {
  shallow,
  mount,
  render
} from 'enzyme'
import sinon from 'sinon'
import expect from 'expect'
import _ from 'lodash';
import FixedDataSheet from '../src/FixedDataSheet';
import DataCell from '../src/DataCell';
import HeaderCell from '../src/DataCell';
import jsdom from 'mocha-jsdom';

import {
  TAB_KEY, ESCAPE_KEY, LEFT_KEY,
  UP_KEY, RIGHT_KEY, DOWN_KEY,
  DELETE_KEY, BACKSPACE_KEY,
  ENTER_KEY
} from '../src/utils/constanct';

import {dispatchKeyDownEvent, triggerMouseEvent} from './testUtils';

describe('FixedDatasheet', () => {
  describe('Shallow component', () => {
    describe('event listeners', () => {
      const savedDoc = global.doc
      after(() => {
        global.document = savedDoc
      })
      it('should remove all event listeners from document', () => {
        const addEvent = sinon.spy()
        const removeEvent = sinon.spy()
        global.document = { addEventListener: addEvent, removeEventListener: removeEvent}

        const component = shallow(
          <FixedDataSheet
            keyFn={(i) => 'custom_key_' + i}
            className={'test'}
            data={[[{data: 1}]]}
            headerData={[[{data: 'header 1'}]]}
            valueRenderer={(cell) => cell.data}
            onChange={() => {}}
          />
        )
        component.unmount()
        expect(removeEvent.callCount).toEqual(5)
      })
    })
  })

  describe('Component', () => {
    let data = []
    let headerData = []
    let component = null
    let wrapper = null
    let customWrapper = null
    jsdom()

    beforeEach(() => {
      data = [
        [{
          className: 'test1',
          data: 4,
          overflow: 'clip'
        }, {
          className: 'test2',
          data: 2,
          key: 'custom_key'
        }],
        [{
          className: 'test3',
          data: 3,
          width: '25%'
        }, {
          className: 'test4',
          data: 5,
          width: 100
        }]
      ]
      headerData = [
        [{
          data: 'Header 1',
          className: 'header-1'
        }, {
          data: 'Header 2',
          className: 'header-2'
        }]
      ]
      component = <FixedDataSheet
        keyFn={(i) => 'custom_key_' + i}
        className={'test'}
        overflow='nowrap'
        data={data}
        headerData={headerData}
        valueRenderer={(cell) => cell.data}
        onChange={(cell, i, j, value) => data[i][j].data = value}
      />
      wrapper = mount(component)
    })
    afterEach(() => {
      wrapper.instance().removeAllListeners()
      if (customWrapper) {
        customWrapper.instance().removeAllListeners()
        customWrapper = null
      }
    })
    describe('rendering with varying props', () => {
      it('renders the proper elements', () => {
        expect(wrapper.find('table').length).toEqual(2)

        // Evaluate tables render with proper classNames
        const tables =  wrapper.find('table').nodes;
        expect(_.values(tables[0].classList)).toEqual(['dtg-virtual-header', 'data-grid', 'test', 'nowrap'])
        expect(_.values(tables[1].classList)).toEqual(['dtg-main', 'data-grid', 'test', 'nowrap'])

        // Evaluate table headers
        const virtualHeaderCells = wrapper.find('table.dtg-virtual-header th > span').nodes.map(n => n.innerHTML)
        const mainHeaderCells = wrapper.find('table.dtg-main th > span').nodes.map(n => n.innerHTML)
        const headerContent = ['Header 1', 'Header 2'];
        expect(wrapper.find('th > span').length).toEqual(4)
        expect(virtualHeaderCells).toEqual(headerContent)
        expect(mainHeaderCells).toEqual(headerContent)

        // Evaluate table body content
        expect(wrapper.find('td > span').length).toEqual(4)
        expect(wrapper.find('td > span').nodes.map(n => n.innerHTML)).toEqual(['4', '2', '3', '5'])
      })

      it('renders the proper keys', () => {
        // Evaluate header row keys
        expect(wrapper.find('table thead tr').at(0).key()).toEqual('custom_key_header_0')
        expect(wrapper.find(HeaderCell).at(1).key()).toEqual('custom_key')

        // Evaluate body row keys
        expect(wrapper.find('table tbody tr').at(0).key()).toEqual('custom_key_0')
        expect(wrapper.find('table tbody tr').at(1).key()).toEqual('custom_key_1')
        expect(wrapper.find(DataCell).at(1).key()).toEqual('custom_key')
      })

      it('sets the proper classes for the cells', () => {
        expect(wrapper.find('td').nodes.map(n => _.values(n.classList).sort()))
          .toEqual([
            ['cell', 'clip', 'test1'],
            ['cell', 'test2'],
            ['cell', 'test3'],
            ['cell', 'test4']
          ])
      })
      it('renders the data in the input properly if dataRenderer is set', () => {
        customWrapper = mount(
          <FixedDataSheet
            data={data}
            headerData={headerData}
            dataRenderer={(cell) => '=+' + cell.data}
            valueRenderer={(cell) => cell.data}
            onChange={(cell, i, j, value) => data[i][j].data = value}
          />
        )
        customWrapper.find('td').first().simulate('doubleClick')
        expect(customWrapper.find('td.cell input').nodes[0].value).toEqual('=+4')
      })

      it('renders proper elements by column', () => {
        const withDates = data.map((row, index) => [{data: new Date('2017-0' + (index + 1) + '-01')}, ...row])
        customWrapper = mount(
          <FixedDataSheet
            headerData={headerData}
            data={withDates}
            valueRenderer={(cell, i, j, isHeader) => j === 0 && !isHeader ? cell.data.toGMTString() : cell.data}
            dataRenderer={(cell, i, j) => j === 0 ? cell.data.toISOString() : cell.data}
            onChange={(cell, i, j, value) => data[i][j].data = value}
          />
        )
        // expect(wrapper.find('td > span').length).toEqual(6);
        expect(customWrapper.find('td > span').nodes.map(n => n.innerHTML)).toEqual(['Sun, 01 Jan 2017 00:00:00 GMT', '4', '2', 'Wed, 01 Feb 2017 00:00:00 GMT', '3', '5'])
      })

      it('renders data in the input properly if dataRenderer is set by column', () => {
        const withDates = data.map((row, index) => [{data: new Date('2017-0' + (index + 1) + '-01')}, ...row])
        customWrapper = mount(
          <FixedDataSheet
            headerData={headerData}
            data={withDates}
            valueRenderer={(cell, i, j, isHeader) => j === 0 && !isHeader ? cell.data.toGMTString() : cell.data}
            dataRenderer={(cell, i, j) => j === 0 ? cell.data.toISOString() : cell.data}
            onChange={(cell, i, j, value) => data[i][j].data = value}
          />
        )
        customWrapper.find('td').first().simulate('doubleClick')
        expect(customWrapper.find('td.cell input').nodes[0].value).toEqual('2017-01-01T00:00:00.000Z')
      })

      it('renders the attributes to the cell if the attributesRenderer is set', () => {
        customWrapper = mount(
          <FixedDataSheet
            headerData={headerData}
            data={data}
            valueRenderer={(cell, i, j, isHeader) => cell.data}
            dataRenderer={(cell, i, j) => cell.data}
            attributesRenderer={(cell, i, j, isHeader) => {
              if (!isHeader) {
                if (i === 0 && j === 0) {
                  return {'data-hint': 'Not valid'}
                }
                
                if (i === 1 && j === 1) {
                  return {'data-hint': 'Valid'}
                }
              }

              return null
            }}
            onChange={(cell, i, j, value) => data[i][j].data = value}
          />
        )

        expect(customWrapper.find('td.cell').first().props()['data-hint']).toEqual('Not valid')
        expect(customWrapper.find('td.cell').last().props()['data-hint']).toEqual('Valid')
      })

      it('renders a component properly', () => {
        customWrapper = mount(<FixedDataSheet
          headerData={[[{data: 'Header'}]]}
          data={[[{component: <div className={'custom-component'}>COMPONENT RENDERED</div>}]]}
          valueRenderer={(cell) => 'VALUE RENDERED'}
          onChange={(cell, i, j, value) => data[i][j].data = value}
        />)
        expect(customWrapper.find('td').text()).toEqual('VALUE RENDERED')
        customWrapper.find('td').first().simulate('doubleClick')
        expect(customWrapper.find('td').text()).toEqual('COMPONENT RENDERED')
      })

      it('forces a component rendering', () => {
        customWrapper = mount(<FixedDataSheet
          headerData={[[{data: 'Header'}]]}
          data={[[{forceComponent: true, component: <div className={'custom-component'}>COMPONENT RENDERED</div>}]]}
          valueRenderer={(cell) => 'VALUE RENDERED'}
          onChange={(cell, i, j, value) => data[i][j].data = value}
        />)
        expect(customWrapper.find('td').text()).toEqual('COMPONENT RENDERED')
        customWrapper.find('td').first().simulate('mousedown')
        customWrapper.find('td').first().simulate('mouseover')
        customWrapper.find('td').first().simulate('doubleClick')
        expect(customWrapper.state('start')).toEqual({i: 0, j: 0})
        expect(customWrapper.find('td').text()).toEqual('COMPONENT RENDERED')
      })

      it('renders a cell with readOnly field properly', () => {
        customWrapper = mount(<FixedDataSheet
          headerData={[[{data: 'Header'}, {data: 'Header 2'}]]}
          data={[[{data: 12, readOnly: true}, {data: 24, readOnly: false}]]}
          valueRenderer={(cell) => cell.data}
          dataRenderer={(cell) => '=+' + cell.data}
          onChange={(cell, i, j, value) => data[i][j].data = value}
        />)
        expect(customWrapper.find('td.cell').at(0).text()).toEqual(12)
        expect(customWrapper.find('td.cell').at(1).text()).toEqual(24)
        customWrapper.find('td').at(0).simulate('mouseDown')
        customWrapper.find('td').at(0).simulate('doubleClick')
        customWrapper.find('td').at(1).simulate('mouseDown')
        customWrapper.find('td').at(1).simulate('doubleClick')

        expect(customWrapper.find('td.cell').at(0).text()).toEqual(12)
        expect(customWrapper.find('td.cell').at(1).text()).toEqual(24)

        expect(customWrapper.find('td.cell input').at(0).html()).toEqual('<input style="display: none;">')
        expect(customWrapper.find('td.cell input').at(1).html()).toEqual('<input style="display: block;">')
      })

      it('renders a cell with disabled events', () => {
        customWrapper = mount(<FixedDataSheet
          headerData={[[{value: 'Header'}, {value: 'Header 2'}]]}
          data={[[{data: 12, disableEvents: true}, {data: 24, disableEvents: true}]]}
          valueRenderer={(cell) => cell.data}
          onChange={(cell, i, j, value) => data[i][j].data = value}
        />)
        customWrapper.find('td').at(0).simulate('mouseDown')
        customWrapper.find('td').at(0).simulate('doubleClick')
        expect(customWrapper.state()).toEqual({
          start: {},
          end: {},
          selecting: false,
          editing: {},
          reverting: {},
          forceEdit: false,
          clear: {},
          scrollLeft: 0,
          scrollTop: 0
        })
      })

      it('render fixed columns and header on scroll', (done) => {
        customWrapper = mount(
          <FixedDataSheet
            headerData={[[{data: 'Header', fixed: true}, {data: 'Header 2'}]]}
            width={'10px'}
            height={'10px'}
            data={[[{data: 12, fixed: true}, {data: 24}]]}
            valueRenderer={(cell, i, j, isHeader) => cell.data}
            onChange={(cell, i, j, value) => data[i][j].data = value}
          />
        )

        customWrapper.setState({
          scrollTop: 30,
          scrollLeft: 10
        }, () => {
          const mainTable = customWrapper.find('table.dtg-main');
          const header = customWrapper.find('table.dtg-virtual-header');
          const headerCells = customWrapper.find('table.dtg-virtual-header th');
          const bodyCells = customWrapper.find('td');

          expect(mainTable.node.classList.contains('scrolling')).toBe(true);
          expect(header.node.classList.contains('scrolling')).toBe(true);
          expect(header.node.style.top).toEqual('30px')
          expect(headerCells.at(0).node.style.left).toEqual('10px')
          expect(headerCells.at(1).node.style.left).toEqual('')
          expect(bodyCells.at(0).node.style.left).toEqual('10px')
          expect(bodyCells.at(1).node.style.left).toEqual('')

          // Classnames header
          expect(headerCells.at(0).node.classList.contains('fixed-column')).toBe(true)
          expect(headerCells.at(0).node.classList.contains('last')).toBe(true)
          expect(headerCells.at(0).node.classList.contains('scrolling')).toBe(true)
          expect(headerCells.at(1).node.classList.contains('fixed-column')).toBe(false)
          expect(headerCells.at(1).node.classList.contains('last')).toBe(false)
          expect(headerCells.at(1).node.classList.contains('scrolling')).toBe(false)

          // Classnames body
          expect(bodyCells.at(0).node.classList.contains('fixed-column')).toBe(true)
          expect(bodyCells.at(0).node.classList.contains('last')).toBe(true)
          expect(bodyCells.at(0).node.classList.contains('scrolling')).toBe(true)
          expect(bodyCells.at(1).node.classList.contains('fixed-column')).toBe(false)
          expect(bodyCells.at(1).node.classList.contains('last')).toBe(false)
          expect(bodyCells.at(1).node.classList.contains('scrolling')).toBe(false)
          done()
        })
      })
    })

    describe('selection', () => {
      it('', () => {
        customWrapper = mount(<FixedDataSheet
          headerData={[[{data: 'Header'}, {data: 'Header 2'}]]}
          data={[[{data: 12, disableEvents: true}, {data: 24, disableEvents: true}]]}
          valueRenderer={(cell) => cell.data}
          onChange={(cell, i, j, value) => data[i][j].data = value}
        />)
        customWrapper.find('td').at(0).simulate('mouseDown')
        customWrapper.find('td').at(0).simulate('doubleClick')
        expect(customWrapper.state()).toEqual({
          start: {},
          end: {},
          selecting: false,
          editing: {},
          reverting: {},
          forceEdit: false,
          clear: {},
          scrollLeft: 0,
          scrollTop: 0
        })
      })
    })

    describe('selection', () => {
      it('selects a single field properly', () => {
        expect(wrapper.find('td.cell.selected').length).toEqual(0)
        wrapper.find('td').at(1).simulate('mouseDown')
        wrapper.find('td').at(1).simulate('mouseUp')
        expect(wrapper.find('td.cell.selected').length).toEqual(1)
        expect(wrapper.find('td.cell.selected span').nodes[0].innerHTML).toEqual('2')
      })

      it('selects multiple field properly 2x2 (hold left click)', () => {
        expect(wrapper.find('td.cell.selected').length).toEqual(0)
        wrapper.find('td').at(0).simulate('mouseDown')
        wrapper.find('td').at(3).simulate('mouseOver')
        expect(wrapper.find('td.cell.selected').length).toEqual(4)
        expect(wrapper.find('td.cell.selected span').nodes.map(n => n.innerHTML)).toEqual(['4', '2', '3', '5'])

        expect(wrapper.state('selecting')).toEqual(true)
        expect(wrapper.state('editing')).toEqual({})
        expect(wrapper.state('start')).toEqual({
          i: 0,
          j: 0
        })
        expect(wrapper.state('end')).toEqual({
          i: 1,
          j: 1
        })
      })

      it('selects multiple field properly 2x2 and stay selected after releasing mouse button', () => {
        let mouseUpEvt = document.createEvent('HTMLEvents')
        mouseUpEvt.initEvent('mouseup', false, true)

        expect(wrapper.find('.selected').length).toEqual(0)
        expect(wrapper.find('td.cell').length).toEqual(4)
        wrapper.find('td').at(0).simulate('mouseDown')
        wrapper.find('td').at(3).simulate('mouseOver')
        expect(wrapper.state('start')).toEqual({ i: 0, j: 0 })
        expect(wrapper.state('end')).toEqual({ i: 1, j: 1 })
        expect(wrapper.state('selecting')).toEqual(true)
        document.dispatchEvent(mouseUpEvt)
        expect(wrapper.state('selecting')).toEqual(false)
      })

      it('calls onSelect prop when a new element is selected', (done) => {
        customWrapper = mount(
          <FixedDataSheet
            headerData={headerData}
            data={data}
            onSelect={(cell) => {
              try {
                expect(cell).toEqual({data: 4, className: 'test1', overflow: 'clip'})
                done()
              } catch (err) {
                done(err)
              }
            }}
            valueRenderer={(cell) => cell.data}
            onChange={(cell, i, j, value) => custData[i][j].data = value}
            />)
        customWrapper.find('td').at(0).simulate('mouseDown')
        expect(customWrapper.state('end')).toEqual({i: 0, j: 0})
      })
    })

    describe('keyboard movement', () => {
      it('moves right with arrow keys', () => {
        wrapper.find('td').at(0).simulate('mouseDown')
        expect(wrapper.state('start')).toEqual({i: 0, j: 0})
        dispatchKeyDownEvent(RIGHT_KEY)
        expect(wrapper.state('start')).toEqual({i: 0, j: 1})
      })
      it('moves left with arrow keys', () => {
        wrapper.find('td').at(1).simulate('mouseDown')
        expect(wrapper.state('start')).toEqual({i: 0, j: 1})
        dispatchKeyDownEvent(LEFT_KEY)
        expect(wrapper.state('start')).toEqual({i: 0, j: 0})
      })
      it('moves up with arrow keys', () => {
        wrapper.find('td').at(3).simulate('mouseDown')
        expect(wrapper.state('start')).toEqual({i: 1, j: 1})
        dispatchKeyDownEvent(UP_KEY)
        expect(wrapper.state('start')).toEqual({i: 0, j: 1})
      })
      it('moves down with arrow keys', () => {
        wrapper.find('td').at(0).simulate('mouseDown')
        expect(wrapper.state('start')).toEqual({i: 0, j: 0})
        dispatchKeyDownEvent(DOWN_KEY)
        expect(wrapper.state('start')).toEqual({i: 1, j: 0})
      })
      it('moves to next row if there is no right cell', () => {
        wrapper.find('td').at(1).simulate('mouseDown')
        expect(wrapper.state('start')).toEqual({i: 0, j: 1})
        dispatchKeyDownEvent(TAB_KEY)
        expect(wrapper.state('start')).toEqual({i: 1, j: 0})
      })

      it('tab and shift tab keys', () => {
        wrapper.find('td').at(0).simulate('mouseDown')
        expect(wrapper.state('start')).toEqual({i: 0, j: 0})
        dispatchKeyDownEvent(TAB_KEY, false) // shift tab
        expect(wrapper.state('start')).toEqual({i: 0, j: 1})
        dispatchKeyDownEvent(TAB_KEY, true) // shift tab
        expect(wrapper.state('start')).toEqual({i: 0, j: 0})
      })
    })

    describe('editing', () => {
      let cells = null
      beforeEach(() => {
        cells = wrapper.find('td')
      })

      it('starts editing when double clicked', () => {
        expect(wrapper.find('td.cell.selected').length).toEqual(0)
        cells.at(3).simulate('doubleClick')
        expect(wrapper.state('editing')).toEqual({
          i: 1,
          j: 1
        })
        expect(wrapper.state('forceEdit')).toEqual(true)

        cells.at(3).simulate('mousedown') // mousedown should not affect edit mode
        cells.at(2).simulate('mouseover') // mouseover should not affect edit mode
        expect(wrapper.state('editing')).toEqual({
          i: 1,
          j: 1
        })
      })

      it('starts editing when enter key pressed', () => {
        cells.at(3).simulate('mousedown')
        dispatchKeyDownEvent(ENTER_KEY)
        expect(wrapper.state('editing')).toEqual({
          i: 1,
          j: 1
        })
        expect(wrapper.state('forceEdit')).toEqual(true)

        cells.at(3).simulate('mousedown') // mousedown should not affect edit mode
        cells.at(2).simulate('mouseover') // mouseover should not affect edit mode
        expect(wrapper.state('editing')).toEqual({
          i: 1,
          j: 1
        })
        expect(wrapper.state('clear')).toEqual({})
      })

      it('starts editing certain keys are pressed', () => {
      // [0  , 9 ,a , z , 0 , 9  , +  , = , decim]
        [48, 57, 65, 90, 96, 105, 107, 187, 189].map(charCode => {
          cells.at(0).simulate('mousedown')
          dispatchKeyDownEvent(charCode)
          expect(wrapper.state('editing')).toEqual({i: 0, j: 0})
          cells.at(1).simulate('mousedown')
          expect(wrapper.state('editing')).toEqual({})
        })
      })

      it('does not start editing if cell is readOnly', () => {
        wrapper.setProps({data: [[{data: 1, readOnly: true}, {data: 2, readOnly: true}]]});
      // [0  , 9 ,a , z , 0 , 9  , +  , = , decim]
        [48, 57, 65, 90, 96, 105, 107, 187, 189].map(charCode => {
          cells.at(0).simulate('mousedown')
          dispatchKeyDownEvent(charCode)
          expect(wrapper.state('editing')).toEqual({})
          cells.at(1).simulate('mousedown')
          expect(wrapper.state('editing')).toEqual({})
        })
      })

      it('goes out of edit mode when another cell is clicked', () => {
        cells.at(0).simulate('mouseDown')
        dispatchKeyDownEvent('1'.charCodeAt(0))
        wrapper.find('td.cell.selected input').node.value = 213
        wrapper.find('td.cell.selected input').simulate('change')
        cells.at(1).simulate('mouseDown')
        expect(data[0][0].data).toEqual(213)
        expect(wrapper.state('editing')).toEqual({})
      })

      it('goes out of edit mode when ENTER is clicked', () => {
        cells.at(0).simulate('mouseDown')
        dispatchKeyDownEvent('1'.charCodeAt(0))
        wrapper.find('td.cell.selected input').node.value = 213
        wrapper.find('td.cell.selected input').simulate('change')
        dispatchKeyDownEvent(ENTER_KEY)
        expect(data[0][0].data).toEqual(213)
        expect(wrapper.state('editing')).toEqual({})
      })

      it('goes out of edit mode and reverts to original value when ESCAPE is pressed', () => {
        cells.at(0).simulate('mouseDown')
        dispatchKeyDownEvent('1'.charCodeAt(0))
        wrapper.find('td.cell.selected input').node.value = 213
        wrapper.find('td.cell.selected input').simulate('change')
        dispatchKeyDownEvent(ESCAPE_KEY)
        expect(data[0][0].data).toEqual(4)
        expect(wrapper.state('editing')).toEqual({})
        expect(wrapper.state('reverting')).toEqual({ i: 0, j: 0 })
      })

      it('goes to the next row when editing and enter key pressed when edit started via double click', () => {
        cells.at(1).simulate('mousedown')
        dispatchKeyDownEvent('1'.charCodeAt(0))
        expect(wrapper.state('editing')).toEqual({
          i: 0,
          j: 1
        })

        const newPosition = {i: 1, j: 1}
        dispatchKeyDownEvent(ENTER_KEY)
        expect(wrapper.state('editing')).toEqual({})
        expect(wrapper.state('start')).toEqual(newPosition)
        expect(wrapper.state('end')).toEqual(newPosition)
      })

      it('goes to the next row when editing and enter key pressed', () => {
        cells.at(1).simulate('mousedown')
        dispatchKeyDownEvent(ENTER_KEY)
        expect(wrapper.state('editing')).toEqual({
          i: 0,
          j: 1
        })

        const newPosition = {i: 1, j: 1}
        dispatchKeyDownEvent(ENTER_KEY)
        expect(wrapper.state('editing')).toEqual({})
        expect(wrapper.state('start')).toEqual(newPosition)
        expect(wrapper.state('end')).toEqual(newPosition)
      })

      it('updates value properly after double clicking', () => {
        cells.at(0).simulate('mouseDown')
        cells.at(0).simulate('mouseUp')
        cells.at(0).simulate('doubleClick')

        expect(wrapper.state()).toEqual({
          start: { i: 0, j: 0 },
          end: { i: 0, j: 0 },
          selecting: true,
          editing: { i: 0, j: 0 },
          reverting: {},
          forceEdit: true,
          clear: {},
          scrollLeft: 0,
          scrollTop: 0
        })

        cells.at(0).find('input').node.value = 213
        cells.at(0).find('input').simulate('change')
        dispatchKeyDownEvent(RIGHT_KEY)
        expect(data[0][0].data).toEqual(4)
        dispatchKeyDownEvent(TAB_KEY)
        expect(data[0][0].data).toEqual(213)
      })

      it('moves to the next cell on left/right arrow if editing wasn\'t started via double click or pressing enter', () => {
        cells.at(0).simulate('mouseDown')
        cells.at(0).simulate('mouseUp')
        dispatchKeyDownEvent('1'.charCodeAt(0))
        expect(wrapper.state()).toEqual({
          start: { i: 0, j: 0 },
          end: { i: 0, j: 0 },
          selecting: true,
          editing: { i: 0, j: 0 },
          reverting: {},
          forceEdit: false,
          clear: { i: 0, j: 0 },
          scrollLeft: 0,
          scrollTop: 0
        })
        wrapper.find('td.cell.selected input').node.value = 213
        wrapper.find('td.cell.selected input').simulate('change')

        expect(data[0][0].data).toEqual(4)
        dispatchKeyDownEvent(RIGHT_KEY)
        expect(data[0][0].data).toEqual(213)
        expect(wrapper.state()).toEqual({
          start: { i: 0, j: 1 }, // RIGHT_KEY movement
          end: { i: 0, j: 1 }, // RIGHT_KEY movement
          selecting: true,
          editing: {},
          reverting: {},
          forceEdit: false,
          clear: { i: 0, j: 0 },
          scrollLeft: 0,
          scrollTop: 0
        })
      })

      it('doesn\'t moves to the next cell on left/right arrow if cell is a component', () => {
        data[0][0].component = <div>HELLO</div>
        wrapper.setProps({data: data})
        expect(wrapper.exists(<div>HELLO</div>)).toEqual(true)
        cells.at(0).simulate('mouseDown')
        cells.at(0).simulate('mouseUp')
        dispatchKeyDownEvent('1'.charCodeAt(0))
        expect(wrapper.state()).toEqual({
          start: { i: 0, j: 0 },
          end: { i: 0, j: 0 },
          selecting: true,
          editing: { i: 0, j: 0 },
          reverting: {},
          forceEdit: false,
          clear: { i: 0, j: 0 },
          scrollLeft: 0,
          scrollTop: 0
        })
        dispatchKeyDownEvent(RIGHT_KEY)
        expect(wrapper.state()).toEqual({
          start: { i: 0, j: 0 }, // RIGHT_KEY movement
          end: { i: 0, j: 0 }, // RIGHT_KEY movement
          selecting: true,
          editing: { i: 0, j: 0 },
          reverting: {},
          forceEdit: false,
          clear: { i: 0, j: 0 },
          scrollLeft: 0,
          scrollTop: 0
        })
      })

      it('copies the data properly', () => {
        let copied = ''
        const evt = document.createEvent('HTMLEvents')
        evt.initEvent('copy', false, true)
        evt.clipboardData = { setData: (type, text) => copied = text}

        cells.at(0).simulate('mouseDown')
        cells.at(3).simulate('mouseOver')
        document.dispatchEvent(evt)
        expect(copied).toEqual('4\t2\n3\t5')
      })

      it('copies the data from dataRenderer if it exists', () => {
        let copied = ''
        const evt = document.createEvent('HTMLEvents')
        evt.initEvent('copy', false, true)
        evt.clipboardData = { setData: (type, text) => copied = text}
        customWrapper = mount(
          <FixedDataSheet
            headerData={headerData}
            data={data}
            valueRenderer={(cell, i, j, isHeader) => cell.data}
            dataRenderer={(cell, i, j) => `{${i},${j}}${cell.data}`}
            onChange={(cell, i, j, value) => data[i][j].data = value}
          />
        )
        customWrapper.find('td').at(0).simulate('mouseDown')
        customWrapper.find('td').at(3).simulate('mouseOver')

        document.dispatchEvent(evt)
        expect(copied).toEqual('{0,0}4\t{0,1}2\n{1,0}3\t{1,1}5')
      })

      it('copies no data if there isn\'t anything selected', () => {
        let pasted = ''
        const evt = document.createEvent('HTMLEvents')
        evt.initEvent('copy', false, true)
        evt.clipboardData = { setData: (type, text) => pasted = text}

        expect(wrapper.state('start')).toEqual({})
        document.dispatchEvent(evt)
        expect(pasted).toEqual('')
      })

      it('does not paste data if no cell is selected', () => {
        const evt = document.createEvent('HTMLEvents')
        evt.initEvent('paste', false, true)
        evt.clipboardData = { getData: (type) => '99\t100\n1001\t1002'}
        document.dispatchEvent(evt)
        expect(data[0].map(d => d.data)).toEqual([4, 2])
        expect(data[1].map(d => d.data)).toEqual([3, 5])
      })
      it('pastes data properly', () => {
        cells.at(0).simulate('mouseDown')
        expect(wrapper.state('end')).toEqual({i: 0, j: 0})

        const evt = document.createEvent('HTMLEvents')
        evt.initEvent('paste', false, true)
        evt.clipboardData = { getData: (type) => '99\t100\n1001\t1002'}
        document.dispatchEvent(evt)

        expect(data[0].map(d => d.data)).toEqual(['99', '100'])
        expect(data[1].map(d => d.data)).toEqual(['1001', '1002'])
        expect(wrapper.state('end')).toEqual({i: 1, j: 1})
      })

      it('pastes data properly on a different cell', () => {
        const datacust = [[{data: 12, readOnly: true}, {data: 24, readOnly: false}]]
        customWrapper = mount(
          <FixedDataSheet
            headerData={[[{value: 'Header 1'}, {value: 'Header 2'}]]}
            data={datacust}
            valueRenderer={(cell, i, j, isHeader) => isHeader ? cell.value : cell.data}
            onChange={(cell, i, j, value) => datacust[i][j].data = value}
          />
        )
        customWrapper.find('td').at(1).simulate('mouseDown')

        let evt = document.createEvent('HTMLEvents')
        evt.initEvent('paste', false, true)
        evt.clipboardData = { getData: (type) => '99\t100\n1001\t1002'}
        document.dispatchEvent(evt)

        expect(datacust[0].map(d => d.data)).toEqual([12, '99'])
      })

      it('pastes multiple rows correclty on windows', () => {
        const datacust = [[{data: 12, readOnly: true}, {data: 24, readOnly: false}], [{data: 1012, readOnly: true}, {data: 1024, readOnly: false}]]
        customWrapper = mount(
          <FixedDataSheet
            headerData={[[{value: 'Header 1'}, {value: 'Header 2'}]]}
            data={datacust}
            valueRenderer={(cell, i, j, isHeader) => isHeader ? cell.value : cell.data}
            onChange={(cell, i, j, value) => datacust[i][j].data = value}
          />
        )
        customWrapper.find('td').at(1).simulate('mouseDown')

        let evt = document.createEvent('HTMLEvents')
        evt.initEvent('paste', false, true)
        evt.clipboardData = { getData: (type) => '99\t100\r\n1001\t1002'}
        document.dispatchEvent(evt)

        expect(datacust[1].map(d => d.data)).toEqual([1012, '1001'])
      })

      it('doesnt auto paste data if cell is editing', () => {
        const datacust = [[{data: 12, readOnly: false}, {data: 24, readOnly: false}]]
        customWrapper = mount(
          <FixedDataSheet
            headerData={[[{value: 'Header 1'}, {value: 'Header 2'}]]}
            data={datacust}
            valueRenderer={(cell, i, j, isHeader) => isHeader ? cell.value : cell.data}
            onChange={(cell, i, j, value) => datacust[i][j].data = value}
          />
        )
        customWrapper.find('td').at(1).simulate('doubleclick')

        let evt = document.createEvent('HTMLEvents')
        evt.initEvent('paste', false, true)
        evt.clipboardData = { getData: (type) => '100'}

        expect(datacust[0].map(d => d.data)).toEqual([12, 24])
      })

      it('pastes data properly and fires onPaste function if defined', (done) => {
        const datacust = [[{data: 12, readOnly: true}, {data: 24, readOnly: false}]]
        customWrapper = mount(
          <FixedDataSheet
            headerData={[[{data: 'Header 1'}, {data: 'Header 2'}]]}
            data={datacust}
            valueRenderer={(cell) => cell.data}
            onChange={(cell, i, j, value) => datacust[i][j].data = value}
            onPaste={(pasted) => {
              try {
                expect(pasted).toEqual([
                  [
                    {cell: datacust[0][0], data: '99'},
                    {cell: datacust[0][1], data: '100'}
                  ],
                  [
                    {cell: undefined, data: '1001'},
                    {cell: undefined, data: '1002'}
                  ]
                ])
                done()
              } catch (err) {
                done(err)
              }
            }}
          />
        )
        customWrapper.find('td').at(0).simulate('mouseDown')
        let evt = document.createEvent('HTMLEvents')
        evt.initEvent('paste', false, true)
        evt.clipboardData = { getData: (type) => '99\t100\n1001\t1002'}
        document.dispatchEvent(evt)
      })

      it('pastes data properly, using parsePaste if defined', () => {
        const datacust = [[{data: 12, readOnly: true}, {data: 24, readOnly: false}], [{data: 1012, readOnly: true}, {data: 1024, readOnly: false}]]
        customWrapper = mount(
          <FixedDataSheet
            headerData={[[{data: 'Header 1'}, {data: 'Header 2'}]]}
            data={datacust}
            valueRenderer={(cell) => cell.data}
            onChange={(cell, i, j, value) => datacust[i][j].data = value}
            // "--" is our arbitrary row delimiter, "," is our arbitrary field delimiter
            parsePaste={(pasted) => {
              return pasted.split('--').map((line) => line.split(','))
            }}
          />
        )
        customWrapper.find('td').at(1).simulate('mouseDown')

        let evt = document.createEvent('HTMLEvents')
        evt.initEvent('paste', false, true)
        evt.clipboardData = { getData: (type) => '99,100--1001,1002'}
        document.dispatchEvent(evt)

        expect(datacust[1].map(d => d.data)).toEqual([1012, '1001'])
      })

      it('stops editing on outside page click', () => {
        const cell = wrapper.find('td').first()
        cell.simulate('mouseDown')
        cell.simulate('doubleClick')
        triggerMouseEvent(document, 'mousedown')

        expect(wrapper.state()).toEqual({
          start: {},
          end: {},
          selecting: false,
          editing: {},
          reverting: {},
          forceEdit: false,
          clear: {},
          scrollLeft: 0,
          scrollTop: 0
        })
      })

      it('pageClick does not execute if the mouse click is within', () => {
        const cell = wrapper.find('td').first()
        cell.simulate('mousedown')
        cell.simulate('mouseup')

        let evt = document.createEvent('HTMLEvents')
        evt.initEvent('mousedown', false, true)
        Object.defineProperty(evt, 'target', {value: cell.getDOMNode()})
        document.dispatchEvent(evt)

        expect(wrapper.state()).toEqual({
          start: {i: 0, j: 0},
          end: {i: 0, j: 0},
          selecting: true,
          editing: {},
          reverting: {},
          forceEdit: false,
          clear: {},
          scrollLeft: 0,
          scrollTop: 0
        })
      })
      it('delete on DELETE_KEY', () => {
        const cell = wrapper.find('td').first()
        data[0][1] = Object.assign(data[0][1], {readOnly: true})

        wrapper.find('td').at(0).simulate('mouseDown')
        wrapper.find('td').at(1).simulate('mouseOver')

        expect(data[0][0].data).toEqual(4)
        expect(data[0][1].data).toEqual(2)
        dispatchKeyDownEvent(DELETE_KEY)
        expect(data[0][0].data).toEqual('')
        expect(data[0][1].data).toEqual(2)
      })
    })

    describe('contextmenu', () => {
      let cells = null
      beforeEach(() => {
        cells = wrapper.find('td')
      })

      it('starts calls contextmenu with right object', (done) => {
        const datacust = [[{data: 12, readOnly: true}, {data: 24, readOnly: false}]]
        customWrapper = mount(
          <FixedDataSheet
            headerData={[[{value: 'Header 1'}, {value: 'Header 2'}]]}
            data={datacust}
            valueRenderer={(cell, i, j, isHeader) => isHeader ? cell.value : cell.data}
            onChange={(cell, i, j, value) => datacust[i][j].data = value}
            onContextMenu={(e, cell, i, j) => {
              try {
                expect(cell).toEqual({data: 12, readOnly: true})
                done()
              } catch (err) {
                done(err)
              }
            }}
          />
        )
        customWrapper.find('td').at(0).simulate('contextmenu')
      })
    })
  })
})
