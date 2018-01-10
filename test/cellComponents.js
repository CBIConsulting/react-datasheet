import React from 'react'

import {
  shallow,
  mount
} from 'enzyme'
import sinon from 'sinon'
import expect from 'expect'
import ComponentCell from '../src/ComponentCell';
import DataCell from '../src/DataCell';
import HeaderCell from '../src/HeaderCell';
import jsdom from 'mocha-jsdom';

describe('Cell Components', () => {
  describe('DataCell', () => {
    describe('rendering', () => {
      it('should properly render', () => {
        const onMouseDown = sinon.spy()
        const onMouseOver = sinon.spy()
        const onDoubleClick = sinon.spy()
        const onContextMenu = sinon.spy()
        const wrapper = shallow(
          <DataCell
            row={2}
            col={3}
            rowSpan={4}
            colSpan={5}
            value={5}
            width={'200px'}
            className={'test'}
            editing={false}
            selected={false}
            onMouseDown={onMouseDown}
            onDoubleClick={onDoubleClick}
            onMouseOver={onMouseOver}
            onContextMenu={onContextMenu}
          />
        )

        expect(wrapper.html()).toEqual(
          shallow(
            <td className='test cell' colSpan={5} rowSpan={4} style={{ width: '200px' }}>
              <span style={{display: 'block'}}>5</span>
              <input style={{display: 'none'}} />
            </td>
          ).html()
        )

        wrapper.simulate('mousedown')
        wrapper.simulate('doubleclick')
        wrapper.simulate('mouseover')
        wrapper.simulate('contextmenu')

        expect(onDoubleClick.calledWith(2, 3)).toEqual(true)
        expect(onMouseDown.calledWith(2, 3)).toEqual(true)
        expect(onMouseOver.calledWith(2, 3)).toEqual(true)
        const args = onContextMenu.getCall(0).args
        expect(args[1]).toEqual(2)
        expect(args[2]).toEqual(3)
        wrapper.unmount()
      })

      it('should properly all update functions and render reading mode to editing mode ', () => {
        const props = {
          editing: false,
          selected: false,
          value: 5,
          data: 5,
          row: 1,
          col: 1,
          onMouseDown: () => {},
          onMouseOver: () => {},
          onDoubleClick: () => {},
          onContextMenu: () => {}
        }
        const wrapper = shallow(
          <DataCell
            {...props}
          />
        )
        expect(wrapper.html()).toEqual(
          shallow(
            <td className='cell' colSpan={1} rowSpan={1}>
              <span style={{display: 'block'}}>5</span>
              <input style={{display: 'none'}} />
            </td>
          ).html()
        )

        wrapper.setProps({ editing: true, selected: true })

        expect(wrapper.html()).toEqual(
          shallow(
            <td className='cell selected editing' colSpan={1} rowSpan={1}>
              <span style={{display: 'none'}}>5</span>
              <input style={{display: 'block'}} />
            </td>
          ).html()
        )

        wrapper.unmount()
      })

      it('should properly render a flash when value changes', () => {
        const props = {
          editing: false,
          selected: false,
          value: 5,
          data: 5,
          row: 1,
          col: 1,
          onMouseDown: () => {},
          onMouseOver: () => {},
          onDoubleClick: () => {},
          onContextMenu: () => {}
        }
        const wrapper = shallow(
          <DataCell
            {...props}
          />
        )
        wrapper.setProps({ value: 6 })
        expect(wrapper.html()).toEqual(
          shallow(
            <td className='cell updated' colSpan={1} rowSpan={1}>
              <span style={{display: 'block'}}>6</span>
              <input style={{display: 'none'}} />
            </td>
          ).html()
        )

        wrapper.unmount()
      })

      it('should properly render when it\'s fixed', () => {
        const props = {
          editing: false,
          selected: false,
          value: 5,
          data: 5,
          row: 1,
          col: 1,
          fixed: true,
          left: '20px',
          onMouseDown: () => {},
          onMouseOver: () => {},
          onDoubleClick: () => {},
          onContextMenu: () => {}
        }
        const wrapper = shallow(
          <DataCell
            {...props}
          />
        )

        expect(wrapper.html()).toEqual(
          shallow(
            <td className='cell fixed-column' colSpan={1} rowSpan={1} style={{left: '20px'}}>
              <span style={{display: 'block'}}>5</span>
              <input style={{display: 'none'}} />
            </td>
          ).html()
        )

        wrapper.unmount()
      })
    })

    describe('editing', () => {
      let onChange = null
      let props = null
      let wrapper = null
      jsdom()
      beforeEach(() => {
        wrapper && wrapper.detach()
        props = {
          editing: false,
          reverting: false,
          selected: false,
          value: '2',
          data: '5',
          row: 1,
          col: 2,
          onChange: sinon.spy(),
          onMouseDown: () => {},
          onDoubleClick: () => {},
          onMouseOver: () => {},
          onContextMenu: () => {}
        }
        document.body.innerHTML = '<table><tbody><tr id="root"></tr></tbody></table>'
        wrapper = mount(<DataCell {...props} />, {attachTo: document.getElementById('root')})
      })

      it('should not call onChange if value is the same', () => {
        wrapper.setProps({ editing: true, selected: true })
        expect(wrapper.find('input').node.value).toEqual('5')
        wrapper.find('input').node.value = '5'
        wrapper.find('input').simulate('change')
        wrapper.setProps({ editing: false, selected: true })
        expect(props.onChange.called).toEqual(false)
      })

      it('should properly call onChange', () => {
        wrapper.setProps({ editing: true, selected: true })
        wrapper.find('input').node.value = '6'
        wrapper.find('input').simulate('change')
        wrapper.setProps({ editing: false, selected: true })
        expect(props.onChange.called).toEqual(true)
        expect(props.onChange.calledWith(props.row, props.col, '6')).toEqual(true)
      })

      it('input value should be cleared if we go into editing with clear call', () => {
        wrapper.setProps({ editing: true, selected: true, clear: true})
        expect(wrapper.find('input').node.value).toEqual('')
      })
      it('input value should be set to value if data is null', () => {
        wrapper.setProps({ data: null})
        wrapper.setProps({ editing: true, selected: true})
        expect(wrapper.find('input').node.value).toEqual('2')

        wrapper.find('input').node.value = '2'
        wrapper.find('input').simulate('change')
        wrapper.setProps({ editing: false, selected: true })
        expect(props.onChange.called).toEqual(false)
      })
    })
  })

  describe('ComponentCell', () => {
    describe('rendering', () => {
      it('should properly render', () => {
        const onMouseDown = sinon.spy()
        const onMouseOver = sinon.spy()
        const onDoubleClick = sinon.spy()
        const onContextMenu = sinon.spy()
        const wrapper = shallow(
          <ComponentCell
            row={2}
            col={3}
            readOnly={false}
            forceComponent
            rowSpan={4}
            colSpan={5}
            value={5}
            width={'200px'}
            className={'test'}
            editing={false}
            selected={false}
            component={<div>HELLO</div>}
            onMouseDown={onMouseDown}
            onDoubleClick={onDoubleClick}
            onMouseOver={onMouseOver}
            onContextMenu={onContextMenu}
          />
        )

        expect(wrapper.html()).toEqual(
          shallow(
            <td className='test cell' colSpan={5} rowSpan={4} style={{width: '200px'}}>
              <div>HELLO</div>
            </td>
          ).html()
        )
        wrapper.setProps({forceComponent: false})
        expect(wrapper.html()).toEqual(
          shallow(
            <td className='test cell' colSpan={5} rowSpan={4} style={{width: '200px'}}>
              5
            </td>
          ).html()
        )
        wrapper.setProps({value: 7})
        expect(wrapper.html()).toEqual(
          shallow(
            <td className='test cell updated' colSpan={5} rowSpan={4} style={{width: '200px'}}>
              7
            </td>
          ).html()
        )
        wrapper.simulate('mousedown')
        wrapper.simulate('doubleclick')
        wrapper.simulate('mouseover')
        wrapper.simulate('contextmenu')

        expect(onDoubleClick.calledWith(2, 3)).toEqual(true)
        expect(onMouseDown.calledWith(2, 3)).toEqual(true)
        expect(onMouseOver.calledWith(2, 3)).toEqual(true)
        const args = onContextMenu.getCall(0).args
        expect(args[1]).toEqual(2)
        expect(args[2]).toEqual(3)
        wrapper.unmount()
      })

      it('should properly render when it\'s fixed', () => {
        const wrapper = shallow(
          <ComponentCell
            row={2}
            col={3}
            readOnly={false}
            forceComponent
            rowSpan={4}
            colSpan={5}
            value={5}
            className={'test'}
            editing={false}
            selected={false}
            width={'200px'}
            left={'50px'}
            fixed
            component={<div>HELLO</div>}
            onMouseDown={() => {}}
            onDoubleClick={() => {}}
            onMouseOver={() => {}}
            onContextMenu={() => {}}
          />
        )

        expect(wrapper.html()).toEqual(
          shallow(
            <td
              className='test cell fixed-column'
              colSpan={5}
              rowSpan={4}
              style={{width: '200px', left: '50px'}}
            >
              <div>HELLO</div>
            </td>
          ).html()
        )
      })
    })

    describe('rendering', () => {
      it('should properly render a change (flashing)', (done) => {
        const wrapper = shallow(
          <ComponentCell
            row={2}
            col={3}
            readOnly={false}
            forceComponent
            value={5}
            className={'test'}
            editing={false}
            selected={false}
            component={<div>HELLO</div>}
            onMouseDown={() => {}}
            onDoubleClick={() => {}}
            onMouseOver={() => {}}
            onContextMenu={() => {}}
          />
        )
        wrapper.setProps({value: 7})
        expect(wrapper.html()).toEqual(
          shallow(<td className='test cell updated' colSpan={1} rowSpan={1}>
            <div>HELLO</div>
          </td>).html())

        setTimeout(() => {
          try {
            expect(wrapper.html()).toEqual(
              shallow(
                <td className='test cell' colSpan={1} rowSpan={1}>
                  <div>HELLO</div>
                </td>
              ).html()
            )
            done()
          } catch (e) {
            done(e)
          }
        }, 750)
      })
    })
  })

  describe('HeaderCell', () => {
    describe('rendering', () => {
      it('should properly render', () => {
        const wrapper = shallow(
          <HeaderCell
            row={2}
            col={3}
            rowSpan={4}
            colSpan={5}
            value={'Header Value'}
            width={'200px'}
            className={'test'}
            component={<div>Header Test</div>}
          />
        )

        expect(wrapper.html()).toEqual(
          shallow(
            <th
              className='test header-cell cell read-only'
              colSpan={5}
              rowSpan={4}
              style={{width: '200px'}}
            >
              <div>Header Test</div>
            </th>
          ).html()
        )

        wrapper.setProps({component: null})
        expect(wrapper.html()).toEqual(
          shallow(
            <th
              className='test header-cell cell read-only'
              colSpan={5}
              rowSpan={4}
              style={{width: '200px'}}
            >
              <span style={{display: 'block'}}>
                Header Value
              </span>
            </th>
          ).html()
        )
        
        wrapper.unmount()
      })

      it('rendering fixed on scrolling', () => {
        const wrapper = shallow(
          <HeaderCell
            row={1}
            col={1}
            value={'Header Test'}
            fixed
            left={null}
            width={'200px'}
            left={'100px'}
            className={'test'}
          />
        )

        expect(wrapper.html()).toEqual(
          shallow(
            <th
              className='test header-cell cell read-only fixed-column'
              colSpan={1}
              rowSpan={1}
              style={{width: '200px', left: '100px'}}
            >
              <span style={{display: 'block'}}>
                Header Test
              </span>
            </th>
          ).html()
        )
        
        wrapper.unmount()
      })
    })
  })
})