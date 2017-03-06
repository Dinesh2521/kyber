import React from 'react';
import { safeInvoke } from 'js-utility-belt/es6';
import classnames from 'classnames';

import AccountActions from '../actions/account_actions';
import AccountStore from '../stores/account_store';

import Spinner from './spinner';

const AccountList = React.createClass({
    propTypes: {
        activeAccount: React.PropTypes.object,
        assetList: React.PropTypes.array,
        appName: React.PropTypes.string,
        children: React.PropTypes.node,
        className: React.PropTypes.string,
        handleAccountClick: React.PropTypes.func
    },

    getInitialState() {
        return AccountStore.getState();
    },

    componentDidMount() {
        AccountStore.listen(this.onChange);
        this.fetchAccountList();
    },

    componentWillUnmount() {
        AccountStore.unlisten(this.onChange);
    },

    onChange(state) {
        this.setState(state);
    },

    fetchAccountList() {
        const { appName } = this.props;
        AccountActions.flushAccountList();
        AccountActions.fetchAccountList({ app: appName });
    },

    render() {
        const {
            activeAccount,
            assetList,
            children,
            className,
            handleAccountClick
        } = this.props;
        
        const { accountList } = this.state;

        if (accountList && accountList.length > 0) {
            return (
                <div className={classnames(className)}>
                    {accountList
                        .sort((a, b) => {
                            if (a.name < b.name) return -1;
                            if (a.name > b.name) return 1;
                            return 0;
                        })
                        .map(account => (
                            <AccountWrapper
                                key={account.vk}
                                account={account}
                                assetList={assetList}
                                isActive={activeAccount === account}
                                handleClick={handleAccountClick}>
                                {children}
                            </AccountWrapper>
                        ))}
                </div>
            );
        } else {
            return (
                <div style={{ margin: '2em' }}>
                    <Spinner />
                </div>
            );
        }
    }
});

const AccountWrapper = React.createClass({
    propTypes: {
        account: React.PropTypes.object,
        assetList: React.PropTypes.array,
        children: React.PropTypes.node,
        handleClick: React.PropTypes.func,
        isActive: React.PropTypes.bool
    },

    handleClick() {
        const { account, handleClick } = this.props;
        safeInvoke(handleClick, account);
    },

    render() {
        const {
            account,
            assetList,
            isActive,
            children
        } = this.props;

        return (
            <div>
                {
                    React.Children.map(children, (child) =>
                        React.cloneElement(child, {
                            account,
                            assetList,
                            isActive,
                            handleClick: this.handleClick
                        })
                    )
                }
            </div>
        );
    }
});

export default AccountList;
