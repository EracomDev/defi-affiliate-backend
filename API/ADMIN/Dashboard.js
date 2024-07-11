const Activity = require("../../MODALS/Activity");
const Transaction = require("../../MODALS/transactions");
const UserData = require("../../MODALS/userData");

class DASHBOARD {
  async getStats(req, res) {
    try {
      // User stats
      const totalUsers = await UserData.countDocuments();
      const activeUsers = await UserData.countDocuments({ status: 1 });
      const inactiveUsers = await UserData.countDocuments({ status: 0 });

      // Today's date setup
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayUsers = await UserData.countDocuments({ joining_date: { $gte: today } });
      const todayActiveUsers = await UserData.countDocuments({ Activation_date: { $gte: today } });

      // Withdrawal stats
      const totalWithdrawals = await Transaction.countDocuments({ tx_type: 'withdrawal' });
      const pendingWithdrawals = await Transaction.countDocuments({ tx_type: 'withdrawal', status: 0 });
      const approvedWithdrawals = await Transaction.countDocuments({ tx_type: 'withdrawal', status: 1 });
      const rejectedWithdrawals = await Transaction.countDocuments({ tx_type: 'withdrawal', status: 2 });

      const todayWithdrawals = await Transaction.countDocuments({ tx_type: 'withdrawal', time: { $gte: today } });
      const todayPendingWithdrawals = await Transaction.countDocuments({ tx_type: 'withdrawal', status: 0, time: { $gte: today } });
      const todayApprovedWithdrawals = await Transaction.countDocuments({ tx_type: 'withdrawal', status: 1, time: { $gte: today } });
      const todayRejectedWithdrawals = await Transaction.countDocuments({ tx_type: 'withdrawal', status: 2, time: { $gte: today } });

      // Payment request stats
      const totalPaymentRequests = await Transaction.countDocuments({ tx_type: 'add_fund' });
      const pendingPaymentRequests = await Transaction.countDocuments({ tx_type: 'add_fund', status: 0 });
      const approvedPaymentRequests = await Transaction.countDocuments({ tx_type: 'add_fund', status: 1 });
      const rejectedPaymentRequests = await Transaction.countDocuments({ tx_type: 'add_fund', status: 2 });

      const todayPaymentRequests = await Transaction.countDocuments({ tx_type: 'add_fund', time: { $gte: today } });
      const todayPendingPaymentRequests = await Transaction.countDocuments({ tx_type: 'add_fund', status: 0, time: { $gte: today } });
      const todayApprovedPaymentRequests = await Transaction.countDocuments({ tx_type: 'add_fund', status: 1, time: { $gte: today } });
      const todayRejectedPaymentRequests = await Transaction.countDocuments({ tx_type: 'add_fund', status: 2, time: { $gte: today } });

      // Income activities
      const incomeActivities = await Activity.find({ type: 'income' }).select('name');

      // Total and today income
      const totalIncome = await Transaction.aggregate([
        { $match: { tx_type: { $in: incomeActivities.map(act => act.name) }, debit_credit: 'credit' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const todayIncome = await Transaction.aggregate([
        { $match: { tx_type: { $in: incomeActivities.map(act => act.name) }, debit_credit: 'credit', date: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      // Bet activities
      const totalBet = await Transaction.aggregate([
        { $match: { tx_type: 'bet' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const todayBet = await Transaction.aggregate([
        { $match: { tx_type: 'bet', date: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      // Win activities
      const totalWin = await Transaction.aggregate([
        { $match: { tx_type: 'win' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const todayWin = await Transaction.aggregate([
        { $match: { tx_type: 'win', date: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      // Respond with all stats
      res.json({
        totalUsers,
        activeUsers,
        inactiveUsers,
        todayUsers,
        todayActiveUsers,
        totalWithdrawals,
        pendingWithdrawals,
        approvedWithdrawals,
        rejectedWithdrawals,
        todayWithdrawals,
        todayPendingWithdrawals,
        todayApprovedWithdrawals,
        todayRejectedWithdrawals,
        totalPaymentRequests,
        pendingPaymentRequests,
        approvedPaymentRequests,
        rejectedPaymentRequests,
        todayPaymentRequests,
        todayPendingPaymentRequests,
        todayApprovedPaymentRequests,
        todayRejectedPaymentRequests,
        totalIncome: totalIncome[0]?.total || 0,
        todayIncome: todayIncome[0]?.total || 0,
        totalBet: totalBet[0]?.total || 0,
        todayBet: todayBet[0]?.total || 0,
        totalWin: totalWin[0]?.total || 0,
        todayWin: todayWin[0]?.total || 0,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

const Dashboard = new DASHBOARD();
module.exports = Dashboard;
