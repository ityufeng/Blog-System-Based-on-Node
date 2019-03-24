import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Table,
  notification,
  Popconfirm,
  Divider,
  Tag,
  Select,
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import TimeAxisComponent from './TimeAxisComponent';

const FormItem = Form.Item;

/* eslint react/no-multi-comp:0 */
@connect(({ timeAxis }) => ({
  timeAxis,
}))
@Form.create()
class TableList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      changeType: false,
      title: '',
      stateComponent: '',
      content: '',
      start_time: new Date(),
      end_time: new Date(),
      visible: false,
      loading: false,
      keyword: '',
      state: '', // 状态 1 是已经完成 ，2 是正在进行，3 是没完成 ,'' 代表所有时间轴
      pageNum: 1,
      pageSize: 10,
      columns: [
        {
          title: '标题',
          width: 150,
          dataIndex: 'title',
        },
        {
          title: '内容',
          width: 350,
          dataIndex: 'content',
        },
        {
          title: '状态',
          dataIndex: 'state', // 状态 1 是已经完成 ，2 是正在进行，3 是没完成
          render: val => {
            // 状态 1 是已经完成 ，2 是正在进行，3 是没完成
            if (val === 1) {
              return <Tag color="green">已经完成</Tag>;
            }
            if (val === 2) {
              return <Tag color="red">正在进行</Tag>;
            }
            return <Tag>没完成</Tag>;
          },
        },
        {
          title: '开始时间',
          dataIndex: 'start_time',
          sorter: true,
          render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
        },
        {
          title: '结束时间',
          dataIndex: 'end_time',
          sorter: true,
          render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
        },
        {
          title: '操作',
          width: 150,
          render: (text, record) => (
            <div>
              <Fragment>
                <a onClick={() => this.showModal(record)}>修改</a>
              </Fragment>
              <Divider type="vertical" />
              <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(text, record)}>
                <a href="javascript:;">删除</a>
              </Popconfirm>
            </div>
          ),
        },
      ],
    };

    this.handleChangeKeyword = this.handleChangeKeyword.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.showModal = this.showModal.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleChangeState = this.handleChangeState.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeContent = this.handleChangeContent.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.onChangeTime = this.onChangeTime.bind(this);
  }

  componentDidMount() {
    this.handleSearch(this.state.pageNum, this.state.pageSize);
  }

  onChangeTime(date, dateString) {
    console.log(date, dateString);
    this.setState({
      start_time: new Date(dateString[0]),
      end_time: new Date(dateString[1]),
    });
  }

  handleSubmit() {
    const { dispatch } = this.props;
    const { timeAxisDetail } = this.props.timeAxis;
    if (this.state.changeType) {
      const params = {
        id: timeAxisDetail._id,
        state: this.state.stateComponent,
        title: this.state.title,
        content: this.state.content,
        start_time: this.state.start_time,
        end_time: this.state.end_time,
      };
      new Promise(resolve => {
        dispatch({
          type: 'timeAxis/updateTimeAxis',
          payload: {
            resolve,
            params,
          },
        });
      }).then(res => {
        if (res.code === 0) {
          notification.success({
            message: res.message,
          });
          this.setState({
            visible: false,
            chnageType: false,
          });
          this.handleSearch(this.state.pageNum, this.state.pageSize);
        } else {
          notification.error({
            message: res.message,
          });
        }
      });
    } else {
      const params = {
        state: this.state.stateComponent,
        title: this.state.title,
        content: this.state.content,
        start_time: this.state.start_time,
        end_time: this.state.end_time,
      };
      new Promise(resolve => {
        dispatch({
          type: 'timeAxis/addTimeAxis',
          payload: {
            resolve,
            params,
          },
        });
      }).then(res => {
        if (res.code === 0) {
          notification.success({
            message: res.message,
          });
          this.setState({
            visible: false,
            chnageType: false,
          });
          this.handleSearch(this.state.pageNum, this.state.pageSize);
        } else {
          notification.error({
            message: res.message,
          });
        }
      });
    }
  }

  handleChange(event) {
    this.setState({
      title: event.target.value,
    });
  }

  handleChangeContent(event) {
    this.setState({
      content: event.target.value,
    });
  }

  handleStateChange(value) {
    this.setState({
      stateComponent: value,
    });
  }

  handleChangeState(state) {
    this.setState(
      {
        state,
      },
      () => {
        this.handleSearch();
      }
    );
  }

  handleChangeKeyword(event) {
    this.setState({
      keyword: event.target.value,
    });
  }

  handleChangePageParam(pageNum, pageSize) {
    this.setState(
      {
        pageNum,
        pageSize,
      },
      () => {
        this.handleSearch();
      }
    );
  }

  showModal = record => {
    if (record._id) {
      const { dispatch } = this.props;
      const params = {
        id: record._id,
      };
      new Promise(resolve => {
        dispatch({
          type: 'timeAxis/getTimeAxisDetail',
          payload: {
            resolve,
            params,
          },
        });
      }).then(res => {
        // console.log('res :', res)
        if (res.code === 0) {
          this.setState({
            visible: true,
            changeType: true,
            stateComponent: res.data.state,
            title: res.data.title,
            content: res.data.content,
          });
        } else {
          notification.error({
            message: res.message,
          });
        }
      });
    } else {
      this.setState({
        visible: true,
        changeType: false,
        stateComponent: '',
        title: '',
        content: '',
      });
    }
  };

  handleOk = () => {
    this.handleSubmit();
  };

  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  handleSearch = () => {
    this.setState({
      loading: true,
    });
    const { dispatch } = this.props;
    const params = {
      keyword: this.state.keyword,
      state: this.state.state,
      pageNum: this.state.pageNum,
      pageSize: this.state.pageSize,
    };
    new Promise(resolve => {
      dispatch({
        type: 'timeAxis/queryTimeAxis',
        payload: {
          resolve,
          params,
        },
      });
    }).then(res => {
      // console.log('res :', res);
      if (res.code === 0) {
        this.setState({
          loading: false,
        });
      } else {
        notification.error({
          message: res.message,
        });
      }
    });
  };

  handleDelete = (text, record) => {
    // console.log('text :', text);
    // console.log('record :', record);
    const { dispatch } = this.props;
    const params = {
      id: record._id,
    };
    new Promise(resolve => {
      dispatch({
        type: 'timeAxis/delTimeAxis',
        payload: {
          resolve,
          params,
        },
      });
    }).then(res => {
      // console.log('res :', res);
      if (res.code === 0) {
        notification.success({
          message: res.message,
        });
        this.handleSearch(this.state.pageNum, this.state.pageSize);
      } else {
        notification.error({
          message: res.message,
        });
      }
    });
  };

  renderSimpleForm() {
    return (
      <Form layout="inline" style={{ marginBottom: '20px' }}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={24} sm={24}>
            <FormItem>
              <Input
                placeholder="留言内容"
                value={this.state.keyword}
                onChange={this.handleChangeKeyword}
              />
            </FormItem>

            <Select
              style={{ width: 200, marginRight: 20 }}
              placeholder="选择状态"
              onChange={this.handleChangeState}
            >
              {/* 状态 1 是已经完成 ，2 是正在进行，3 是没完成 ,'' 代表所有时间轴 */}
              <Select.Option value="">所有</Select.Option>
              <Select.Option value="1">已完成</Select.Option>
              <Select.Option value="2">正在进行</Select.Option>
              <Select.Option value="3">未完成</Select.Option>
            </Select>

            <span>
              <Button
                onClick={this.handleSearch}
                style={{ marginTop: '3px' }}
                type="primary"
                icon="search"
              >
                Search
              </Button>
            </span>
            <span>
              <Button
                onClick={this.showModal}
                style={{ marginTop: '3px', marginLeft: '10px' }}
                type="primary"
              >
                新增
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { timeAxisList, total } = this.props.timeAxis;
    const { pageNum, pageSize } = this.state;
    const pagination = {
      total,
      defaultCurrent: pageNum,
      pageSize,
      showSizeChanger: true,
      onShowSizeChange: (current, pageSize) => {
        // console.log('current, pageSize :', current, pageSize);
        this.handleChangePageParam(current, pageSize);
      },
      onChange: (current, pageSize) => {
        this.handleChangePageParam(current, pageSize);
      },
    };

    return (
      <PageHeaderWrapper title="时间轴管理">
        <Card bordered={false}>
          <div className="">
            <div className="">{this.renderSimpleForm()}</div>
            <Table
              pagination={pagination}
              loading={this.state.loading}
              pagination={pagination}
              rowKey={record => record._id}
              columns={this.state.columns}
              bordered
              dataSource={timeAxisList}
            />
          </div>
        </Card>
        <TimeAxisComponent
          changeType={this.state.changeType}
          title={this.state.title}
          content={this.state.content}
          state={this.state.stateComponent}
          visible={this.state.visible}
          handleOk={this.handleOk}
          handleChange={this.handleChange}
          handleStateChange={this.handleStateChange}
          handleChangeContent={this.handleChangeContent}
          handleCancel={this.handleCancel}
          onChangeTime={this.onChangeTime}
        />
      </PageHeaderWrapper>
    );
  }
}

export default TableList;
