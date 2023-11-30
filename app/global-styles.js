import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`

  .container {
    margin: 0 auto;
  }
  body {
    h1,h2,h3,h4,h5,h6,ul,li,p {
      margin: 0;
      padding: 0;
      color: #1e1147;
    }
    h2 {
      font-size: 22px;
      font-weight: 600;
    }
    h3 {
      font-size: 20px;
      font-weight: 600;
    }
    h4 {
      font-size: 18px;
      font-weight: 600;
    }
    h6 {
      font-size: 16px;
      font-weight: 600;
    }
    input.error {
      color: #ff0000;
      font-weight: 700 !important;
    }
    .ant-select-item {
      font-weight: 500;
      font-size: 15px;
    }
    .ant-picker-content th, .ant-picker-content td {
      font-weight: 500;
    }  
    .ant-message-custom-content {
      display: flex;
      align-item: center;
      span {
        &:first-child {
          line-height: 0;
          top: 3px;
        }
      }
    }
    table {
      tbody.ant-table-tbody {
        td {
          border-left: 1px solid #f0f0f0;
        }
        td.ant-table-cell-row-hover {
          background: #efefef !important;
        }
      }
      thead {
        span.ant-table-column-title {
          white-space: nowrap;
        }
      }    
    }
    .ant-table-filter-dropdown {
      input {
        width: 100% !important;
      }
      button.ant-btn {
        padding: 5px 9px;
        font-size: 12px;
        span.anticon.anticon-search {
          position: relative;
          top: -3px;
        }
      }
    }

    form {
      .ant-row.ant-form-item {
        .ant-col.ant-form-item-control {
          flex: auto;
          width: 100%;
        }    
      }
      .ant-col.ant-form-item-label {
          width: 100%;
          text-align: left;
          margin-bottom: 5px;
          label {
              height: auto;
              color: #2b2b2b;
              font-size: 15px;
          }
      }
      span.ant-input-password {
          padding: 0;
          border: 0;
          outline: none;
          box-shadow: none;
          position: relative;
          input#basic_password {
              width: 100%;
              border: 1px solid #eee;
          }
          span.ant-input-suffix {
              position: absolute;
              right: 20px;
              top: calc(50% - 0px);
          }
      }
      input.ant-input, .ant-input-affix-wrapper > input.ant-input {
          background-color: rgba(228, 228, 228, 0.25) !important;
          padding: 14px 15px;
          outline: none;
          box-shadow: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          &:focus {
            box-shadow: none ;
          }
      }
      .ant-form-item-explain {
        font-size: 13px;
      }
    }
    .amountInput {
      width: 100%;
      background: #fff !important;
      border: 1px solid #e1e1e1;
      padding: 14px 15px;
      border-radius: 8px;
      outline: none;
      &:focus {
        border-color: #e1e1e1;
      }
    }
    .ant-btn {
        background: #3370f0;
        color: #fff;
        padding: 14px 20px;
        border-radius: 5px;
        height: auto;
        border: none;
        transition: 300ms ease-in-out;
        font-size: 15px;
        font-weight: 500;
        &:hover {
            background: #f72585;
            color: #fff;
        }
        &:focus {
          background: #f72585;
          color: #fff;
      }
    }
  }
  .ant-modal-wrap {
    .ant-modal-content {
      border-radius: 16px;
      overflow: hidden;
      button.ant-modal-close {
          color: #fff;
          span {
              font-size: 20px;
              line-height: 15px;
              width: 32px;
              height: 32px;
          }
      }
      .ant-modal-header {
          background: #4cc9f0;
          .ant-modal-title {
              color: #fff;
          }
      }
      .ant-modal-footer {
        display: none;
      }
    }
  }
  
  @media (max-width: 991px) {
    body {
      font-size: 14px;
      h1 {
        font-size: 28px;
      }
      form {
        .ant-col.ant-form-item-label {
          label {
            font-size: 14px;
          }
        }
        input.ant-input, .ant-input-affix-wrapper > input.ant-input {
          font-size: 14px;
        }
        .ant-form-item-explain {
          font-size: 12px;
        }
      }
      .ant-btn {
        font-size: 14px;
      }
    }
  }

  @media (max-width: 767px) {
    body {
      font-size: 13px;
      h1 {
        font-size: 22px;
      }
      h4 {
        font-size: 15px;
      }
      form {
        .ant-col.ant-form-item-label {
          label {
            font-size: 14px;
          }
        }
        input.ant-input, .ant-input-affix-wrapper > input.ant-input {
          font-size: 14px;
        }
        .ant-form-item-explain {
          font-size: 12px;
        }
      }
      .ant-btn {
        font-size: 14px;
      }
    }
  }
`;

export default GlobalStyle;