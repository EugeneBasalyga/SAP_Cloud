using com.bank as db from '../db/data-model';

service CatalogService {
    entity Customers as projection on db.Customer;
    entity ActualResidenceCity as projection on db.ActualResidenceCity;
    entity RegistrationCity as projection on db.RegistrationCity;
    entity MaritalStatus as projection on db.MaritalStatus;
    entity Citizenship as projection on db.Citizenship;
    entity Disability as projection on db.Disability;
    entity Deposit as projection on db.Deposit;
    entity DepositType as projection on db.DepositType;
    entity DepositCurrency as projection on db.DepositCurrency;
    entity Loan as projection on db.Loan;
    entity LoanType as projection on db.LoanType;
    entity LoanCurrency as projection on db.LoanCurrency;
}
