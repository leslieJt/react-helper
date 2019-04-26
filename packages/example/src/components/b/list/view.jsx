/**
 * Created by fed on 2017/8/24.
 */
import React from 'react';
import {
  Input, Table, Form, Tabs, Select, Image,
} from 'shineout';

import store from './reducer';
import './style.css';

const panelStyle = { padding: '12px 0' };

const statusTable = {
  1: '已发货',
  2: '待发货',
  3: '已取消',
};

const categoryList = [
  {
    name: 'dress',
    id: '1',
  },
  {
    name: 'shirts',
    id: '2',
  },
];

const tableColumns = [
  { title: 'id', render: 'id', width: 50 },
  { title: '状态', render: d => statusTable[d.status] },
  { title: 'SKU', render: 'sku' },
  { title: '商品图片', render: d => <Image width={120} height={80} src={d.img} fit="center" /> },
  { title: '商品分类', width: 120, render: d => categoryList.find(x => x.id === d.category).name },
  { title: '商品价格(RMB)', render: 'price' },
];

const conv = () => store.getCate();

class Compo extends React.Component {
  render() {
    const props = this.props;
    const status = props.match.params.id || '0';
    conv();
    return (
      <div style={{ padding: 8 }}>
        <Tabs shape="line" active={status}>
          <Tabs.Panel id="0" style={panelStyle} tab={<a href="#/b/list/0">全部</a>} />
          <Tabs.Panel id="1" style={panelStyle} tab={<a href="#/b/list/1">待发货</a>} />
          <Tabs.Panel id="2" style={panelStyle} tab={<a href="#/b/list/2">已发货</a>} />
          <Tabs.Panel id="3" style={panelStyle} tab={<a href="#/b/list/3">已取消</a>} />
        </Tabs>

        <Form
          inline
          data-bind="conditions"
          onSubmit={(data) => {
            store.search({
              payload: {
                ...data,
                status,
              },
            }).then(res => console.log('res: ', res));
          }}
        >
          <Form.Item label="SKU">
            <Input
              style={{
                width: 150,
              }}
              name="sku"
            />
          </Form.Item>

          <Form.Item label="商品分类">
            <Select
              name="category"
              keygen="id"
              style={{
                width: 150,
              }}
              data={categoryList}
              format="id"
              renderItem="name"
            />
          </Form.Item>

          <Form.Item label="">
            <Form.Submit>搜索</Form.Submit>
          </Form.Item>
        </Form>

        <Table
          style={{ height: 520, width: 800 }}
          fixed="y"
          keygen="id"
          striped
          bordered
          loading={props.dataStatus !== 1}
          columns={tableColumns}
          data={props.data}
        />
      </div>
    );
  }
}

export default Compo;
